import { Request, Response } from "express";
import "dotenv/config";
import { AjouterDepotDto, ModifierDepotDto } from "../dto/depot.dto";
import { Depot } from "../entity/Depot";
import { articlesRepositoy, depotRepository } from "../repository/repositories";
import { Raw } from "typeorm";

export class DepotService {
  /* CREATE ------------------------------------------------------------- */
  public async creerDepot(req: Request, res: Response) {
    const data = req.body as AjouterDepotDto;

    const nouveau = depotRepository.create({
      nom: data.nom,
      adresse: data.adresse || null,
    });
    await depotRepository.save(nouveau);

    res.json({ message: "Dépôt est ajouté", depot: nouveau });
  }

  /* LIST --------------------------------------------------------------- */
  public async listeDepots(req: Request, res: Response) {
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

    const [depots, total] = await depotRepository.findAndCount(findOptions);

    // Count articles for each depot
    let depotsWithCount = depots;
    if (depots.length > 0) {
      const depotIds = depots.map((d) => d.id);

      const articleCounts = await articlesRepositoy
        .createQueryBuilder("article")
        .select("article.depotId", "depotId")
        .addSelect("COUNT(*)", "count")
        .where("article.depotId IN (:...ids)", { ids: depotIds })
        .groupBy("article.depotId")
        .getRawMany();

      depotsWithCount = depots.map((depot) => ({
        ...depot,
        nombreArticles: parseInt(
          articleCounts.find((ac) => ac.depotId === depot.id)?.count || "0",
          10,
        ),
      }));
    }

    res.json({
      depots: depotsWithCount,
      count: total,
      resultsPerPage: isPaginationDisabled ? total : depots.length,
      totalPages: isPaginationDisabled ? 1 : Math.ceil(total / max),
      lastPage: isPaginationDisabled ? true : page >= Math.ceil(total / max),
    });
  }

  /* UPDATE ------------------------------------------------------------- */
  public async modifierDepot(req: Request, res: Response) {
    const data = req.body as ModifierDepotDto;
    const depot = await depotRepository.findOneBy({ id: data.id });

    if (!depot)
      return res.status(404).json({ message: "Dépôt n'est pas trouvé" });

    depot.nom = data.nom;
    if (data.adresse !== undefined) depot.adresse = data.adresse || null;
    await depotRepository.save(depot);

    res.json({ message: "Dépôt est modifié" });
  }

  /* DELETE ------------------------------------------------------------- */
  public async supprimerDepot(req: Request, res: Response) {
    const { id } = req.query as any;

    const exists = await depotRepository.exist({ where: { id } });
    if (!exists) return res.status(404).json({ message: "Dépôt introuvable" });

    await depotRepository.delete(id);
    res.json({ message: "Dépôt est supprimé" });
  }
}
