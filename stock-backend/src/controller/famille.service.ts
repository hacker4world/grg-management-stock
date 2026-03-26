import { Request, Response } from "express";
import "dotenv/config";
import {
  CreerFamilleDto,
  ModifierFamilleDto,
  SupprimerFamileDto,
} from "../dto/famille.dto";
import {
  categoryRepository,
  familleRepository,
  sousFamillesRepository,
} from "../repository/repositories";
import { Famille } from "../entity/Famille";
import { fetchFamille } from "../utilities/fetch.util";
import { Raw } from "typeorm";

export class FamilleService {
  public async creerFamille(request: Request, response: Response) {
    const data = request.body as CreerFamilleDto;

    const nouveauFamille = familleRepository.create({
      nom: data.nom.trim(),
    });

    await familleRepository.save(nouveauFamille);
    return response.json({
      message: "Famille ajoutée",
      famille: nouveauFamille,
    });
  }

  public async listeFamilles(request: Request, response: Response) {
    const q = request.query;
    const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;

    // Pagination validation
    let page = 0;
    let isPaginationDisabled = false;

    if (q.page !== undefined) {
      const pageNum = Number(q.page);
      if (isNaN(pageNum)) {
        return response.status(400).json({
          message: "Le paramètre 'page' doit être un nombre",
        });
      }
      page = pageNum;
      if (page === 0) {
        isPaginationDisabled = true;
      } else if (page < 1) {
        return response.status(400).json({
          message: "Le paramètre 'page' doit être supérieur ou égal à 0",
        });
      }
    } else {
      isPaginationDisabled = true;
    }

    const findOptions: any = {
      order: { id: "DESC" },
    };

    if (!isPaginationDisabled) {
      findOptions.skip = (page - 1) * maxPerPage;
      findOptions.take = maxPerPage;
    }

    const [familles, total] = await familleRepository.findAndCount(findOptions);
    const totalPages = isPaginationDisabled ? 1 : Math.ceil(total / maxPerPage);
    const currentPage = isPaginationDisabled ? 1 : page;
    const lastPage = isPaginationDisabled ? true : currentPage >= totalPages;

    return response.json({
      familles,
      count: familles.length,
      total,
      currentPage,
      totalPages,
      lastPage,
    });
  }

  public async listAll(request: Request, response: Response) {
    const familles = await familleRepository.find({
      order: { id: "DESC" },
    });
    return response.json({
      familles,
    });
  }

  public async rechercherFamilles(request: Request, response: Response) {
    const { search, page } = request.query;
    const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;

    // Validate search parameter
    if (!search || typeof search !== "string" || !search.trim()) {
      return response.status(400).json({
        message:
          "Le paramètre 'search' est requis et doit être une chaîne non vide",
      });
    }

    // Pagination validation
    let pageNum = 0;
    let isPaginationDisabled = false;

    if (page !== undefined) {
      const parsedPage = Number(page);
      if (isNaN(parsedPage)) {
        return response.status(400).json({
          message: "Le paramètre 'page' doit être un nombre",
        });
      }
      pageNum = parsedPage;
      if (pageNum === 0) {
        isPaginationDisabled = true;
      } else if (pageNum < 1) {
        return response.status(400).json({
          message: "Le paramètre 'page' doit être supérieur ou égal à 0",
        });
      }
    } else {
      isPaginationDisabled = true;
    }

    const findOptions: any = {
      where: {
        nom: Raw((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
          nom: `%${search.toString().trim()}%`,
        }),
      },
      order: { id: "DESC" },
    };

    if (!isPaginationDisabled) {
      findOptions.skip = (pageNum - 1) * maxPerPage;
      findOptions.take = maxPerPage;
    }

    const [familles, total] = await familleRepository.findAndCount(findOptions);
    const totalPages = isPaginationDisabled ? 1 : Math.ceil(total / maxPerPage);
    const currentPage = isPaginationDisabled ? 1 : pageNum;
    const lastPage = isPaginationDisabled ? true : currentPage >= totalPages;

    return response.json({
      familles,
      count: familles.length,
      total,
      currentPage,
      totalPages,
      lastPage,
    });
  }

  public async modifierFamille(request: Request, response: Response) {
    const data = request.body as ModifierFamilleDto;

    // Validate ID
    if (!data.famille_id || isNaN(Number(data.famille_id))) {
      return response.status(400).json({ message: "ID de famille invalide" });
    }

    const existingFamille = await fetchFamille(data.famille_id);
    if (!existingFamille) {
      return response.status(404).json({
        message: "Famille non trouvée",
      });
    }

    // Check for duplicate name (excluding current)
    if (data.nom && data.nom.trim() !== existingFamille.nom) {
      const duplicate = await familleRepository.findOne({
        where: { nom: data.nom.trim() },
      });
      if (duplicate && duplicate.id !== existingFamille.id) {
        return response.status(409).json({
          message: "Une famille avec ce nom existe déjà",
        });
      }
      existingFamille.nom = data.nom.trim();
    }

    await familleRepository.save(existingFamille);
    return response.json({
      message: "Famille modifiée",
      famille: existingFamille,
    });
  }

  public async supprimerFamille(request: Request, response: Response) {
    const { id, cascade } = request.query;

    // Validate ID
    if (!id) {
      return response.status(400).json({
        message: "L'ID de la famille est obligatoire",
      });
    }
    if (Array.isArray(id)) {
      return response.status(400).json({
        message: "Un seul ID de famille est autorisé",
      });
    }

    const familleId = Number(id);
    if (isNaN(familleId) || familleId <= 0) {
      return response.status(400).json({
        message: "ID de famille invalide",
      });
    }

    // Fetch famille with its sous-familles
    const famille = await familleRepository.findOne({
      where: { id: familleId },
      relations: ["sous_familles"],
    });

    if (!famille) {
      return response.status(404).json({
        message: "Famille non trouvée",
      });
    }

    // Validate cascade parameter if provided
    if (cascade !== undefined) {
      if (typeof cascade !== "string") {
        return response.status(400).json({
          message: "Le paramètre 'cascade' doit être une chaîne",
        });
      }
      const cascadeLower = cascade.toLowerCase();
      if (cascadeLower !== "yes" && cascadeLower !== "no") {
        return response.status(422).json({
          message: "Choix cascade invalide. Utilisez 'yes' ou 'no'",
        });
      }
    }

    const shouldCascade = cascade && cascade.toString().toLowerCase() === "yes";

    if (!shouldCascade) {
      // Check if famille has related sous-familles
      if (famille.sous_familles && famille.sous_familles.length > 0) {
        return response.status(409).json({
          message: `Impossible de supprimer la famille car elle contient ${famille.sous_familles.length} sous-famille(s). Utilisez cascade=yes pour supprimer tout.`,
        });
      }
      await familleRepository.delete(famille.id);
      return response.json({
        message: "Famille supprimée",
      });
    }

    // Cascade delete: remove all related categories, sous-familles, then famille
    try {
      // Delete all categories under each sous-famille
      for (const sousFamille of famille.sous_familles) {
        await categoryRepository.delete({
          sous_famille: { id: sousFamille.id },
        });
        await sousFamillesRepository.delete(sousFamille.id);
      }

      // Delete the famille itself
      await familleRepository.delete(famille.id);

      return response.json({
        message: "Famille et toutes ses sous-familles supprimées",
      });
    } catch (error) {
      console.error("Error during cascade delete:", error);
      return response.status(500).json({
        message: "Une erreur est survenue lors de la suppression en cascade",
      });
    }
  }
}
