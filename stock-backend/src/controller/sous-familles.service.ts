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

    if (data.famille_id) {
      famille = await fetchFamille(data.famille_id);

      if (!famille) {
        return response.status(404).json({
          message: "Famille n'est pas trouvé",
        });
      }
    }

    const nouveauSousFamille = new SousFamille();

    nouveauSousFamille.nom = data.nom;
    nouveauSousFamille.famille = famille;

    sousFamillesRepository
      .save(nouveauSousFamille)
      .then((sf) => {
        response.json({
          message: "Sous famille est creé",
          sous_famille: sf,
        });
      })
      .catch((err) => {
        console.log(err);
        response.status(500).json({ message: "Un erreur est survenu" });
      });
  }

  public async listeSousFamilles(request: Request, response: Response) {
    const page =
      request.query.page !== undefined ? Number(request.query.page) : 0;
    const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;

    const findOptions: any = { relations: ["famille"] };

    if (page !== 0) {
      findOptions.skip = (page - 1) * maxPerPage;
      findOptions.take = maxPerPage;
    }

    const [sousFamilles, total] =
      await sousFamillesRepository.findAndCount(findOptions);
    const totalPages = page === 0 ? 1 : Math.ceil(total / maxPerPage);

    response.json({
      sousFamilles,
      count: sousFamilles.length,
      totalPages,
      lastPage: page === 0 ? true : page >= totalPages,
    });
  }

  public async filtrerSousFamilles(request: Request, response: Response) {
    let { familleId, page, nom } = request.query;
    const pageNum = page !== undefined ? Number(page) : 0;
    const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;

    let filterOptions: any = {};
    if (familleId && familleId !== "no-family")
      filterOptions.famille = { id: Number(familleId) };
    if (familleId === "no-family") filterOptions.famille = IsNull();
    if (nom)
      filterOptions.nom = Raw((alias) => `Lower(${alias}) LIKE LOWER(:nom)`, {
        nom: `%${nom}%`,
      });

    const findOptions: any = {
      where: filterOptions,
      relations: ["famille"],
    };

    if (pageNum !== 0) {
      findOptions.skip = (pageNum - 1) * maxPerPage;
      findOptions.take = maxPerPage;
    }

    const [sousFamilles, total] =
      await sousFamillesRepository.findAndCount(findOptions);
    const totalPages = pageNum === 0 ? 1 : Math.ceil(total / maxPerPage);

    response.json({
      sousFamilles,
      count: sousFamilles.length,
      totalPages,
      lastPage: pageNum === 0 ? true : pageNum >= totalPages,
    });
  }

  public async modifierSousFamille(request: Request, response: Response) {
    const data = request.body as ModifierSousFamille;

    const sousFamille = await fetchSousFamilles(data.sous_famille_id);
    if (!sousFamille) {
      return response.status(404).json({
        message: "Sous famille n'est pas trouvé",
      });
    } else {
      let famille = null;

      if (data.famille_id != null) {
        famille = await fetchFamille(data.famille_id);
        if (!famille) {
          return response.status(404).json({
            message: "Famille n'est pas trouvé",
          });
        }
      }

      sousFamille.nom = data.nom;
      sousFamille.famille = famille;

      sousFamillesRepository
        .save(sousFamille)
        .then(() => {
          response.json({
            message: "Sous famille est modifié",
          });
        })
        .catch((err) => {
          console.log(err);
          response.status(500).json({ message: "Un erreur est survenu" });
        });
    }
  }

  public async supprimerSousFamille(request: Request, response: Response) {
    const data = request.query;

    const sousFamille = await fetchSousFamilles(Number(data.id));

    if (!sousFamille) {
      return response.status(404).json({
        message: "Sous famille n'est pas trouvé",
      });
    } else {
      let cascade = data.cascade as string;
      if (!cascade || cascade.toLowerCase() == "no") {
        sousFamillesRepository
          .delete(sousFamille)
          .then(() => {
            response.json({
              message: "Sous famille est supprimé",
            });
          })
          .catch((err) => {
            console.log(err);
            response.status(500).json({ message: "Un erreur est survenu" });
          });
      } else {
        let categories = await categoryRepository.find({
          where: { sous_famille: sousFamille },
        });

        for (let category of categories) {
          await categoryRepository.delete(category.id);
        }

        await sousFamillesRepository.delete(sousFamille.id);

        response.json({
          message: "Sous famille est supprimé",
        });
      }
    }
  }
}
