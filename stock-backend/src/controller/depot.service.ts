import { Request, Response, NextFunction, response } from "express";
import "dotenv/config";
import { AjouterDepotDto, ModifierDepotDto } from "../dto/depot.dto";
import { Depot } from "../entity/Depot";
import { articlesRepositoy, depotRepository } from "../repository/repositories";
import { Raw } from "typeorm";

export class DepotService {
  /* CREATE ------------------------------------------------------------- */
  public async creerDepot(req: Request, res: Response) {
    const data = req.body as AjouterDepotDto;

    const existingDepot = await depotRepository.findOne({
      where: { nom: data.nom }
    })

    if (existingDepot) {
      return response.status(400).json({
        message: 'Un dépot avec ce nom déja existe'
      })
    }

    const nouveau = depotRepository.create({
      nom: data.nom.trim(),
      adresse: data.adresse?.trim() || null,
    });
    await depotRepository.save(nouveau);

    return res.json({ message: "Dépôt est ajouté", depot: nouveau });
  }

  /* LIST --------------------------------------------------------------- */
  public async listeDepots(req: Request, res: Response) {
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

    const resultsPerPage = isPaginationDisabled
      ? depotsWithCount.length
      : depots.length;
    const totalPages = isPaginationDisabled ? 1 : Math.ceil(total / max);
    const currentPage = isPaginationDisabled ? 1 : page;
    const lastPage = isPaginationDisabled ? true : currentPage >= totalPages;

    return res.json({
      depots: depotsWithCount,
      total: total,
      count: resultsPerPage,
      currentPage,
      totalPages,
      lastPage,
    });
  }

  /* UPDATE ------------------------------------------------------------- */
  public async modifierDepot(req: Request, res: Response) {
    const data = req.body as ModifierDepotDto;

    // Validate ID
    if (!data.id || isNaN(Number(data.id))) {
      return res.status(400).json({ message: "ID de dépôt invalide" });
    }

    const depot = await depotRepository.findOneBy({ id: Number(data.id) });
    if (!depot) {
      return res.status(404).json({ message: "Dépôt n'est pas trouvé" });
    }

    // Check for duplicate name (excluding current depot)
    if (data.nom && data.nom.trim() !== depot.nom) {
      const existingDepot = await depotRepository.findOneBy({
        nom: data.nom.trim(),
      });
      if (existingDepot && existingDepot.id !== depot.id) {
        return res.status(409).json({
          message: "Un dépôt avec ce nom existe déjà",
        });
      }
      depot.nom = data.nom.trim();
    }

    // Update adresse if provided
    if (data.adresse !== undefined) {
      depot.adresse = data.adresse?.trim() || null;
    }

    await depotRepository.save(depot);

    return res.json({ message: "Dépôt est modifié", depot });
  }

  /* DELETE ------------------------------------------------------------- */
  public async supprimerDepot(req: Request, res: Response) {
    const { id } = req.query;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        message: "L'ID du dépôt est obligatoire",
      });
    }

    // Handle array case (e.g., ?id[]=1&id[]=2)
    if (Array.isArray(id)) {
      return res.status(400).json({
        message: "Un seul ID de dépôt est autorisé",
      });
    }

    const idNum = Number(id);
    if (isNaN(idNum) || idNum <= 0) {
      return res.status(400).json({
        message: "ID de dépôt invalide",
      });
    }

    // Check if depot exists
    const exists = await depotRepository.exist({ where: { id: idNum } });
    if (!exists) {
      return res.status(404).json({ message: "Dépôt introuvable" });
    }

    // Check if depot has articles (optional - prevent deletion if articles exist)
    const articlesCount = await articlesRepositoy.count({
      where: { depot: { id: idNum } },
    });

    await depotRepository.delete(idNum);
    return res.json({ message: "Dépôt est supprimé" });
  }
}
