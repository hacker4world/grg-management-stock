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

    const existingFamille = await familleRepository.findOne({
      where: { nom: data.nom },
    });

    if (existingFamille) {
      response.status(400).json({
        message: "Famille avec ce nom deja existe",
      });
    } else {
      const nouveauFamille = new Famille();

      nouveauFamille.nom = data.nom;

      familleRepository
        .save(nouveauFamille)
        .then(() => {
          response.json({
            message: "Famille est ajouté",
            famille: nouveauFamille,
          });
        })
        .catch((err) => {
          console.log(err);
          response.status(500).json({
            message: "Un erreur est survenu",
          });
        });
    }
  }

  public async listeFamilles(request: Request, response: Response) {
    const page =
      request.query.page !== undefined ? Number(request.query.page) : 0;
    const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;

    const findOptions: any = {};
    if (page !== 0) {
      findOptions.skip = (page - 1) * maxPerPage;
      findOptions.take = maxPerPage;
    }

    const [familles, total] = await familleRepository.findAndCount(findOptions);
    const totalPages = page === 0 ? 1 : Math.ceil(total / maxPerPage);

    response.json({
      familles,
      count: familles.length,
      totalPages,
      lastPage: page === 0 ? true : page >= totalPages,
    });
  }

  public async listAll(request: Request, response: Response) {
    const familles = await familleRepository.find();
    response.json({
      familles,
    });
  }

  public async rechercherFamilles(request: Request, response: Response) {
    const { search, page } = request.query;
    const pageNum = page !== undefined ? Number(page) : 0;
    const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;

    const findOptions: any = {
      where: {
        nom: Raw((alias) => `Lower(${alias}) LIKE LOWER(:nom)`, {
          nom: `%${search}%`,
        }),
      },
    };

    if (pageNum !== 0) {
      findOptions.skip = (pageNum - 1) * maxPerPage;
      findOptions.take = maxPerPage;
    }

    const [familles, total] = await familleRepository.findAndCount(findOptions);
    const totalPages = pageNum === 0 ? 1 : Math.ceil(total / maxPerPage);

    response.json({
      familles,
      count: familles.length,
      totalPages,
      lastPage: pageNum === 0 ? true : pageNum >= totalPages,
    });
  }

  public async modifierFamille(request: Request, response: Response) {
    const data = request.body as ModifierFamilleDto;

    const existingFamille = await fetchFamille(data.famille_id);

    if (!existingFamille) {
      return response.status(404).json({
        message: "Famille n'est pas trouvé",
      });
    } else {
      existingFamille.nom = data.nom;

      familleRepository
        .save(existingFamille)
        .then(() => {
          response.json({
            message: "Famille est modifié",
          });
        })
        .catch((err) => {
          console.log(err);
          response.status(500).json({ message: "Un erreur est survenu" });
        });
    }
  }

  public async supprimerFamille(request: Request, response: Response) {
    const famille_id = Number(request.query.id);
    const cascade = request.query.cascade as string;

    const famille = await familleRepository.findOne({
      where: { id: famille_id },
      relations: ["sous_familles"],
    });

    if (!famille) {
      return response.status(404).json({
        message: "Famille n'est pas trouvé",
      });
    }

    if (
      cascade &&
      cascade.toLowerCase() != "yes" &&
      cascade.toLowerCase() != "no"
    )
      return response.status(422).json({
        message: "Choix cascade invalide",
      });

    if (!cascade || cascade.toLowerCase() == "no") {
      familleRepository
        .delete(famille.id)
        .then(() => {
          response.json({
            message: "Famille est supprimé",
          });
        })
        .catch((err) => {
          console.log(err);
          response.status(500).json({ message: "Un erreur est survenu" });
        });
    } else {
      console.log("cascade delete");

      console.log(famille);

      for (let sous_famille of famille.sous_familles) {
        await categoryRepository.delete({ sous_famille });
        await sousFamillesRepository.delete(sous_famille.id);
      }

      await familleRepository.delete(famille.id);

      return response.json({
        message: "Famille est supprimé",
      });
    }
  }
}
