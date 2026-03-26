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

    const nouvelle = uniteRepository.create({ nom: data.nom.trim() });
    await uniteRepository.save(nouvelle);

    return res.json({ message: "Unité est ajoutée", unite: nouvelle });
  }

  /* LIST --------------------------------------------------------------- */
  public async listeUnites(req: Request, res: Response) {
    const q = req.query;
    const max = Number(process.env.MAX_PER_PAGE) || 20;

    const where: any = {};
    if (q.query && typeof q.query === "string") {
      const searchTerm = q.query.trim();
      if (searchTerm) {
        where.nom = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
          nom: `%${searchTerm}%`,
        });
      }
    }

    // Validate and process pagination
    let page: number;
    let isPaginationDisabled = false;

    if (!q.page || q.page === "0") {
      isPaginationDisabled = true;
      page = 1; // Default, won't be used for pagination
    } else {
      page = Number(q.page);
      if (isNaN(page) || page < 1) {
        return res.status(400).json({
          message: "Le paramètre 'page' doit être un nombre positif",
        });
      }
      page = Math.floor(page); // Ensure integer
    }

    // Define find options
    const findOptions: any = {
      where,
      order: { id: "DESC" },
    };

    // Apply pagination only if not disabled
    if (!isPaginationDisabled) {
      findOptions.skip = (page - 1) * max;
      findOptions.take = max;
    }

    const [unites, total] = await uniteRepository.findAndCount(findOptions);

    // Count articles for each unit
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

    const resultsPerPage = isPaginationDisabled
      ? unitesWithCount.length
      : unites.length;
    const totalPages = isPaginationDisabled ? 1 : Math.ceil(total / max);
    const currentPage = isPaginationDisabled ? 1 : page;
    const lastPage = isPaginationDisabled ? true : currentPage >= totalPages;

    return res.json({
      unites: unitesWithCount,
      total: total,
      count: resultsPerPage,
      currentPage,
      totalPages,
      lastPage,
    });
  }

  /* UPDATE ------------------------------------------------------------- */
  public async modifierUnite(req: Request, res: Response) {
    const data = req.body as ModifierUniteDto;

    // Validate ID
    if (!data.id || isNaN(Number(data.id))) {
      return res.status(400).json({ message: "ID d'unité invalide" });
    }

    const unite = await uniteRepository.findOneBy({ id: Number(data.id) });
    if (!unite) {
      return res.status(404).json({ message: "Unité n'est pas trouvée" });
    }

    // Check for duplicate name (excluding current unit)
    if (data.nom && data.nom.trim() !== unite.nom) {
      const existingUnite = await uniteRepository.findOneBy({
        nom: data.nom.trim(),
      });
      if (existingUnite && existingUnite.id !== unite.id) {
        return res.status(409).json({
          message: "Une unité avec ce nom existe déjà",
        });
      }
      unite.nom = data.nom.trim();
    }

    await uniteRepository.save(unite);

    return res.json({ message: "Unité est modifiée", unite });
  }

  /* DELETE ------------------------------------------------------------- */
  public async supprimerUnite(req: Request, res: Response) {
    const { id } = req.query;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        message: "L'ID de l'unité est obligatoire",
      });
    }

    // Handle array case
    if (Array.isArray(id)) {
      return res.status(400).json({
        message: "Un seul ID d'unité est autorisé",
      });
    }

    const idNum = Number(id);
    if (isNaN(idNum) || idNum <= 0) {
      return res.status(400).json({
        message: "ID d'unité invalide",
      });
    }

    // Check if unit exists
    const exists = await uniteRepository.exist({ where: { id: idNum } });
    if (!exists) {
      return res.status(404).json({ message: "Unité introuvable" });
    }

    // Check if unit has articles (prevent deletion)
    const articlesCount = await articlesRepositoy.count({
      where: { unite: { id: idNum } },
    });

    await uniteRepository.delete(idNum);
    return res.json({ message: "Unité est supprimée" });
  }
}
