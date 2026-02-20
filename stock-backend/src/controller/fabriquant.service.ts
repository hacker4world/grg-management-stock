import { Request, Response } from "express";
import "dotenv/config";
import {
  AjouterFabriquantDto,
  ModifierFabriquantDto,
  SupprimerFabriquantDto,
} from "../dto/fabriquant.dto";
import { fetchFabriquant } from "../utilities/fetch.util";
import { Fabriquant } from "../entity/Fabriquant";
import { fabriquantRepository } from "../repository/repositories";
import { Raw } from "typeorm";

export class FabriquantService {
  public async ajouterFabriquant(request: Request, response: Response) {
    const data = request.body as AjouterFabriquantDto;

    const nouveauFabriquant = new Fabriquant();

    nouveauFabriquant.nom = data.nom;
    nouveauFabriquant.adresse = data.adresse;
    nouveauFabriquant.contact = data.contact;

    fabriquantRepository
      .save(nouveauFabriquant)
      .then(() => {
        response.json({
          message: "Fabriquant est ajouté",
          fabriquant: nouveauFabriquant,
        });
      })
      .catch(() => {
        response.status(500).json({
          message: "Un erreur est survenu",
        });
      });
  }

  public async listeFabriquants(request: Request, response: Response) {
    const data = request.query;
    const pageNum = Number(data.page);
    const page = Number.isNaN(pageNum) ? 1 : pageNum;

    let options: any = {};

    if (data.query)
      options.nom = Raw((alias) => `Lower(${alias}) LIKE LOWER(:nom)`, {
        nom: `%${data.query}%`,
      });

    if (data.adresse)
      options.adresse = Raw((alias) => `Lower(${alias}) LIKE LOWER(:adresse)`, {
        adresse: `%${data.adresse}%`,
      });

    if (data.contact) {
      options.contact = Raw((alias) => `Lower(${alias}) LIKE LOWER(:contact)`, {
        contact: `%${data.contact}%`,
      });
    }

    if (data.code)
      options.code = Number(data.code);

    /* ---------------  NEW LOGIC --------------- */
    if (page === 0) {
      // return everything, no pagination
      const fabriquants = await fabriquantRepository.find({
        where: options,
      });
      return response.json({ fabriquants, count: fabriquants.length });
    }
    /* ------------------------------------------ */

    const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;
    const [fabriquants, total] = await fabriquantRepository.findAndCount({
      skip: (page - 1) * maxPerPage,
      take: maxPerPage,
      where: options,
    });

    const totalPages = Math.ceil(total / maxPerPage);
    response.json({
      fabriquants,
      count: fabriquants.length,
      totalPages,
      lastPage: page >= totalPages,
    });
  }

  public async modifierFabriquant(request: Request, response: Response) {
    const data = request.body as ModifierFabriquantDto;

    fetchFabriquant(data.code_fabriquant)
      .then((fournisseur) => {
        fournisseur.nom = data.nom;
        fournisseur.adresse = data.adresse;
        fournisseur.contact = data.contact;

        fabriquantRepository
          .save(fournisseur)
          .then(() => {
            response.json({
              message: "Fabriquant est modifié",
            });
          })
          .catch((err) => {
            console.log(err);
            response.status(500).json({
              message: "Un erreur est survenu.",
            });
          });
      })
      .catch(() => {
        response.status(404).json({
          message: "Fabriquant n'est pas trouvé",
        });
      });
  }

  public async supprimerFabriquant(request: Request, response: Response) {
    const { code } = request.query as any;

    fabriquantRepository
      .delete(code)
      .then(() => {
        response.json({
          message: "Fabriquant est supprimé",
        });
      })
      .catch((err) => {
        console.log(err);
        response.status(500).json({
          message: "Un erreur est survenu.",
        });
      });
  }
}
