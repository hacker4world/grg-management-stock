import { Request, Response } from "express";
import "dotenv/config";
import { AjouterUniteDto, ModifierUniteDto } from "../dto/unite.dto";
import { Unite } from "../entity/Unite";
import { articlesRepositoy, uniteRepository } from "../repository/repositories";
import { Raw } from "typeorm";

export class UniteService {
  /* CREATE ------------------------------------------------------------- */
  public async creerUnite(req: Request, res: Response) {
    const data = req.body as AjouterUniteDto;

    const nouvelle = uniteRepository.create({ nom: data.nom });
    await uniteRepository.save(nouvelle);

    res.json({ message: "Unité est ajoutée", unite: nouvelle });
  }

  /* LIST --------------------------------------------------------------- */
  /* LIST --------------------------------------------------------------- */
  public async listeUnites(req: Request, res: Response) {
    const q = req.query;
    // Check if pagination is requested (page > 0)
    const isPaginationDisabled = !q.page || Number(q.page) === 0;
    const page = Number(q.page) || 1;
    const max = Number(process.env.MAX_PER_PAGE) || 20;

    const where: any = {};
    if (q.query)
      where.nom = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
        nom: `%${q.query}%`,
      });

    // Define find options
    const findOptions: any = { where };

    // Apply pagination only if not disabled
    if (!isPaginationDisabled) {
      findOptions.skip = (page - 1) * max;
      findOptions.take = max;
    }

    const [unites, total] = await uniteRepository.findAndCount(findOptions);

    let unitesWithCount = unites;
    if (unites.length > 0) {
      const uniteIds = unites.map((u) => u.id);

      const articleCounts = await articlesRepositoy
        .createQueryBuilder("article")
        .select("article.uniteId", "uniteId")
        .addSelect("COUNT(*)", "count")
        .where("article.uniteId IN (:...ids)", { ids: uniteIds })
        .groupBy("article.uniteId")
        .getRawMany();

      unitesWithCount = unites.map((unite) => ({
        ...unite,
        nombreArticles: parseInt(
          articleCounts.find((ac) => ac.uniteId === unite.id)?.count || "0",
          10,
        ),
      }));
    }

    res.json({
      unites: unitesWithCount,
      count: total,
      resultsPerPage: isPaginationDisabled ? total : unites.length,
      totalPages: isPaginationDisabled ? 1 : Math.ceil(total / max),
      lastPage: isPaginationDisabled ? true : page >= Math.ceil(total / max),
    });
  }

  /* UPDATE ------------------------------------------------------------- */
  public async modifierUnite(req: Request, res: Response) {
    const data = req.body as ModifierUniteDto;
    const unite = await uniteRepository.findOneBy({ id: data.id });

    if (!unite)
      return res.status(404).json({ message: "Unité n'est pas trouvée" });

    unite.nom = data.nom;
    await uniteRepository.save(unite);

    res.json({ message: "Unité est modifiée" });
  }

  /* DELETE ------------------------------------------------------------- */
  public async supprimerUnite(req: Request, res: Response) {
    const { id } = req.query as any;

    const exists = await uniteRepository.exist({ where: { id } });
    if (!exists) return res.status(404).json({ message: "Unité introuvable" });

    await uniteRepository.delete(id);
    res.json({ message: "Unité est supprimée" });
  }
}
