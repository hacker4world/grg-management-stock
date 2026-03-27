import { Request, Response } from "express";
import {
  AjouterCategoryDto,
  ModifierCategoryDto,
  SupprimerCategorieDto,
} from "../dto/category.dto";
import {
  categoryRepository,
  sousFamillesRepository,
} from "../repository/repositories";
import { fetchCategory } from "../utilities/fetch.util";
import { Categorie } from "../entity/Categorie";
import "dotenv/config";
import { IsNull, Raw } from "typeorm";

export class CategoriesService {
  public async ajouterCategorie(request: Request, response: Response) {
    const data = request.body as AjouterCategoryDto;

    let sous_famille = null;

    // Handle "no-subfamily" sentinel value or valid numeric ID
    if (data.sous_famille !== "no-subfamily") {
      const sousFamilleId = Number(data.sous_famille);
      if (isNaN(sousFamilleId)) {
        return response.status(400).json({
          message: "ID de sous-famille invalide",
        });
      }
      sous_famille = await sousFamillesRepository.findOne({
        where: { id: sousFamilleId },
        relations: ["famille"],
      });
      if (!sous_famille) {
        return response.status(404).json({
          message: "Sous-famille non trouvée",
        });
      }
    }

    const categorie = categoryRepository.create({
      nom: data.nom.trim(),
      sous_famille,
    });

    const newCategorie = await categoryRepository.save(categorie);
    return response.json({
      message: "Catégorie créée",
      categorie: newCategorie,
    });
  }

  public async listeCategories(request: Request, response: Response) {
    const q = request.query;
    const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;

    // Build filter options
    const filterOptions: any = {};

    // Name search
    if (q.query && typeof q.query === "string") {
      const searchTerm = q.query.trim();
      if (searchTerm) {
        filterOptions.nom = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
          nom: `%${searchTerm}%`,
        });
      }
    }

    // Sous-famille filter
    if (q.sousFamilleId !== undefined) {
      if (q.sousFamilleId === "no-subfamily") {
        filterOptions.sous_famille = IsNull();
      } else {
        const sousFamilleIdNum = Number(q.sousFamilleId);
        if (isNaN(sousFamilleIdNum)) {
          return response.status(400).json({
            message: "ID de sous-famille invalide",
          });
        }
        const sf = await sousFamillesRepository.findOne({
          where: { id: sousFamilleIdNum },
        });
        if (!sf) {
          return response.status(404).json({
            message: "Sous-famille non trouvée",
          });
        }
        filterOptions.sous_famille = sf;
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
      relations: ["sous_famille", "sous_famille.famille"],
      order: { id: "DESC" },
    };

    if (!isPaginationDisabled) {
      findOptions.skip = (pageNum - 1) * maxPerPage;
      findOptions.take = maxPerPage;
    }

    const [categories, total] =
      await categoryRepository.findAndCount(findOptions);
    const totalPages = isPaginationDisabled ? 1 : Math.ceil(total / maxPerPage);
    const currentPage = isPaginationDisabled ? 1 : pageNum;
    const lastPage = isPaginationDisabled ? true : currentPage >= totalPages;

    return response.json({
      categories,
      count: categories.length,
      total,
      currentPage,
      totalPages,
      lastPage,
    });
  }

  public async modifierCategorie(request: Request, response: Response) {
    const data = request.body as ModifierCategoryDto;

    // Validate category ID
    if (!data.category_id || isNaN(Number(data.category_id))) {
      return response.status(400).json({ message: "ID de catégorie invalide" });
    }

    const category = await fetchCategory(data.category_id);
    if (!category) {
      return response.status(404).json({
        message: "Catégorie non trouvée",
      });
    }

    let sousFamille = null;

    // Handle sous-famille update
    if (data.sous_famille !== undefined) {
      if (data.sous_famille === "no-subfamily") {
        sousFamille = null;
      } else {
        const sousFamilleIdNum = Number(data.sous_famille);
        if (isNaN(sousFamilleIdNum)) {
          return response.status(400).json({
            message: "ID de sous-famille invalide",
          });
        }
        sousFamille = await sousFamillesRepository.findOne({
          where: { id: sousFamilleIdNum },
          relations: ["famille"],
        });
        if (!sousFamille) {
          return response.status(404).json({
            message: "Sous-famille non trouvée",
          });
        }
      }
      category.sous_famille = sousFamille;
    }

    if (data.nom !== undefined) {
      category.nom = data.nom.trim();
    }

    const updatedCategorie = await categoryRepository.save(category);
    return response.json({
      message: "Catégorie modifiée",
      categorie: updatedCategorie,
    });
  }

  public async supprimerCategorie(request: Request, response: Response) {
    const { category_id } = request.query;

    // Validate ID
    if (!category_id) {
      return response.status(400).json({
        message: "L'ID de la catégorie est obligatoire",
      });
    }
    if (Array.isArray(category_id)) {
      return response.status(400).json({
        message: "Un seul ID de catégorie est autorisé",
      });
    }

    const idNum = Number(category_id);
    if (isNaN(idNum) || idNum <= 0) {
      return response.status(400).json({
        message: "ID de catégorie invalide",
      });
    }

    const categorie = await categoryRepository.findOne({
      where: { id: idNum },
      relations: ["articles"],
    });
    if (!categorie) {
      return response.status(404).json({
        message: "Catégorie non trouvée",
      });
    }

    await categoryRepository.delete(idNum);
    return response.json({
      message: "Catégorie supprimée",
    });
  }
}
