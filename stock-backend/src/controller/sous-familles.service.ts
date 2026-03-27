import { Request, Response } from "express";
import "dotenv/config";
import {
  CreerSousFamille,
  ModifierSousFamille,
  SupprimerSousFamille,
} from "../dto/sous-famille.dto";
import { fetchFamille, fetchSousFamilles } from "../utilities/fetch.util";
import { SousFamille } from "../entity/SousFamille";
import {
  categoryRepository,
  sousFamillesRepository,
} from "../repository/repositories";
import { IsNull, Raw } from "typeorm";

export class SousFamillesService {
  public async creerSousFamille(request: Request, response: Response) {
    const data = request.body as CreerSousFamille;

    let famille = null;

    // If famille_id is provided, validate it
    if (data.famille_id !== undefined && data.famille_id !== null) {
      famille = await fetchFamille(data.famille_id);
      if (!famille) {
        return response.status(404).json({
          message: "Famille non trouvée",
        });
      }
    }

    const nouveauSousFamille = sousFamillesRepository.create({
      nom: data.nom.trim(),
      famille: famille, // can be null
    });

    await sousFamillesRepository.save(nouveauSousFamille);
    return response.json({
      message: "Sous-famille créée",
      sous_famille: nouveauSousFamille,
    });
  }

  public async listeSousFamilles(request: Request, response: Response) {
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
      relations: ["famille"],
      order: { id: "DESC" },
    };

    if (!isPaginationDisabled) {
      findOptions.skip = (page - 1) * maxPerPage;
      findOptions.take = maxPerPage;
    }

    const [sousFamilles, total] =
      await sousFamillesRepository.findAndCount(findOptions);
    const totalPages = isPaginationDisabled ? 1 : Math.ceil(total / maxPerPage);
    const currentPage = isPaginationDisabled ? 1 : page;
    const lastPage = isPaginationDisabled ? true : currentPage >= totalPages;

    return response.json({
      sousFamilles,
      count: sousFamilles.length,
      total,
      currentPage,
      totalPages,
      lastPage,
    });
  }

  public async filtrerSousFamilles(request: Request, response: Response) {
    const q = request.query;
    const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;

    // Build filter options
    const filterOptions: any = {};

    if (q.familleId !== undefined) {
      if (q.familleId === "no-family") {
        filterOptions.famille = IsNull();
      } else {
        const familleIdNum = Number(q.familleId);
        if (!isNaN(familleIdNum) && familleIdNum > 0) {
          filterOptions.famille = { id: familleIdNum };
        } else {
          return response.status(400).json({
            message: "familleId invalide",
          });
        }
      }
    }

    if (q.nom && typeof q.nom === "string") {
      const searchTerm = q.nom.trim();
      if (searchTerm) {
        filterOptions.nom = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
          nom: `%${searchTerm}%`,
        });
      }
    }

    // Pagination validation
    let pageNum = 0;
    let isPaginationDisabled = false;

    if (q.page !== undefined) {
      const parsedPage = Number(q.page);
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
      where: filterOptions,
      relations: ["famille"],
      order: { id: "DESC" },
    };

    if (!isPaginationDisabled) {
      findOptions.skip = (pageNum - 1) * maxPerPage;
      findOptions.take = maxPerPage;
    }

    const [sousFamilles, total] =
      await sousFamillesRepository.findAndCount(findOptions);
    const totalPages = isPaginationDisabled ? 1 : Math.ceil(total / maxPerPage);
    const currentPage = isPaginationDisabled ? 1 : pageNum;
    const lastPage = isPaginationDisabled ? true : currentPage >= totalPages;

    return response.json({
      sousFamilles,
      count: sousFamilles.length,
      total,
      currentPage,
      totalPages,
      lastPage,
    });
  }

  public async modifierSousFamille(request: Request, response: Response) {
    const data = request.body as ModifierSousFamille;

    // Validate ID
    if (!data.sous_famille_id || isNaN(Number(data.sous_famille_id))) {
      return response
        .status(400)
        .json({ message: "ID de sous-famille invalide" });
    }

    const sousFamille = await fetchSousFamilles(data.sous_famille_id);
    if (!sousFamille) {
      return response.status(404).json({
        message: "Sous-famille non trouvée",
      });
    }

    // Update famille if provided (allowing explicit null)
    if (data.famille_id !== undefined) {
      if (data.famille_id === null) {
        sousFamille.famille = null;
      } else {
        const familleIdNum = Number(data.famille_id);
        if (isNaN(familleIdNum)) {
          return response
            .status(400)
            .json({ message: "ID de famille invalide" });
        }
        const famille = await fetchFamille(familleIdNum);
        if (!famille) {
          return response.status(404).json({
            message: "Famille non trouvée",
          });
        }
        sousFamille.famille = famille;
      }
    }

    // Update name if provided
    if (data.nom !== undefined) {
      sousFamille.nom = data.nom.trim();
    }

    await sousFamillesRepository.save(sousFamille);
    return response.json({
      message: "Sous-famille modifiée",
      sous_famille: sousFamille,
    });
  }

  public async supprimerSousFamille(request: Request, response: Response) {
    const { id } = request.query;

    // Validate ID
    if (!id) {
      return response.status(400).json({
        message: "L'ID de la sous-famille est obligatoire",
      });
    }
    if (Array.isArray(id)) {
      return response.status(400).json({
        message: "Un seul ID de sous-famille est autorisé",
      });
    }

    const sousFamilleId = Number(id);
    if (isNaN(sousFamilleId) || sousFamilleId <= 0) {
      return response.status(400).json({
        message: "ID de sous-famille invalide",
      });
    }

    const sousFamille = await sousFamillesRepository.findOne({
      where: { id: sousFamilleId },
      relations: ["categories"],
    });

    if (!sousFamille) {
      return response.status(404).json({
        message: "Sous-famille non trouvée",
      });
    }

    // Cascade delete: delete all categories first, then the sous-famille
    try {
      if (sousFamille.categories && sousFamille.categories.length > 0) {
        const categoryIds = sousFamille.categories.map((c) => c.id);
        await categoryRepository.delete(categoryIds);
      }
      await sousFamillesRepository.delete(sousFamille.id);
      return response.json({
        message: "Sous-famille et toutes ses catégories supprimées",
      });
    } catch (error) {
      console.error("Error during cascade delete:", error);
      return response.status(500).json({
        message: "Une erreur est survenue lors de la suppression en cascade",
      });
    }
  }
}
