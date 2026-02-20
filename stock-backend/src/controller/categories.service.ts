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
import { fetchCategory, fetchSousFamilles } from "../utilities/fetch.util";
import { Categorie } from "../entity/Categorie";
import "dotenv/config";
import { IsNull, Raw } from "typeorm";

export class CategoriesService {
  public async ajouterCategorie(request: Request, response: Response) {
    const data = request.body as AjouterCategoryDto;

    let sous_famille = null;

    if (data.sous_famille != "no-subfamily") {
      sous_famille = await sousFamillesRepository.findOne({
        where: { id: Number(data.sous_famille) },
        relations: ["famille"],
      });

      if (!sous_famille)
        return response.status(404).json({
          message: "sous famille n'est pas trouvé",
        });
    }

    const categorie = new Categorie();
    categorie.nom = data.nom;
    categorie.sous_famille = sous_famille;

    let newCategorie = await categoryRepository.save(categorie);

    return response.json({
      message: "Catégorie est crée",
      categorie: newCategorie,
    });
  }

  public async listeCategories(request: Request, response: Response) {
    const { page, query, sousFamilleId } = request.query;
    const pageNum = page !== undefined ? Number(page) : 0;
    const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;

    let filterOptions: any = {};
    if (query)
      filterOptions.nom = Raw((alias) => `Lower(${alias}) LIKE LOWER(:nom)`, {
        nom: `%${query}%`,
      });

    if (sousFamilleId) {
      if (sousFamilleId === "no-subfamily")
        filterOptions.sous_famille = IsNull();
      else {
        const sf = await sousFamillesRepository.findOne({
          where: { id: Number(sousFamilleId) },
        });
        if (sf) filterOptions.sous_famille = sf;
      }
    }

    const findOptions: any = {
      where: filterOptions,
      relations: ["sous_famille", "sous_famille.famille"],
    };

    if (pageNum !== 0) {
      findOptions.skip = (pageNum - 1) * maxPerPage;
      findOptions.take = maxPerPage;
    }

    const [categories, total] =
      await categoryRepository.findAndCount(findOptions);
    const totalPages = pageNum === 0 ? 1 : Math.ceil(total / maxPerPage);

    response.json({
      categories,
      count: categories.length,
      totalPages,
      lastPage: pageNum === 0 ? true : pageNum >= totalPages,
    });
  }

  public async modifierCategorie(request: Request, response: Response) {
    const data = request.body as ModifierCategoryDto;

    const category = await fetchCategory(data.category_id);
    if (!category) {
      return response.status(404).json({
        message: "Categorie n'est pas trouvé",
      });
    } else {
      let sousFamille = null;

      if (data.sous_famille != "no-subfamily") {
        sousFamille = await sousFamillesRepository.findOne({
          where: { id: Number(data.sous_famille) },
          relations: ["famille"],
        });

        console.log(sousFamille);

        if (!sousFamille)
          return response.status(404).json({
            message: "sous famille n'est pas trouvé",
          });
      }

      category.nom = data.nom;
      category.sous_famille = sousFamille;

      const updatedCategorie = await categoryRepository.save(category);

      return response.json({
        message: "Catégorie est modifié",
        categorie: updatedCategorie,
      });
    }
  }

  public async supprimerCategorie(request: Request, response: Response) {
    const data = request.query;

    const categorie = await fetchCategory(Number(data.category_id));
    if (!categorie) {
      return response.status(404).json({
        message: "Categorie n'est pas trouvé",
      });
    } else {
      categoryRepository
        .delete(categorie)
        .then(() => {
          response.json({
            message: "Categorie est supprimé",
          });
        })
        .catch((err) => {
          console.log(err);
          response.status(500).json({ message: "Un erreur est survenu" });
        });
    }
  }
}
