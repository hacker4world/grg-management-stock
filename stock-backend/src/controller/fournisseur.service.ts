import { Request, Response } from "express";
import "dotenv/config";
import {
  AjouterFournisseurDto,
  ModifierFournisseur,
  SupprimerFournisseur,
} from "../dto/famille.dto";
import { Fournisseur } from "../entity/Fournisseur";
import { fournisseurRepository } from "../repository/repositories";
import { fetchFournisseurs } from "../utilities/fetch.util";
import { Raw } from "typeorm";

export class FournisseurService {
  public async creerFournisseur(request: Request, response: Response) {
    const fournisseurData = request.body as AjouterFournisseurDto;

    const nouveauFournisseur = new Fournisseur();

    nouveauFournisseur.nom = fournisseurData.nom;
    nouveauFournisseur.adresse = fournisseurData.adresse;
    nouveauFournisseur.contact = fournisseurData.contact;

    fournisseurRepository
      .save(nouveauFournisseur)
      .then(() => {
        return response.status(201).json({
          message: "Fournisseur ajouté.",
          fournisseur: nouveauFournisseur,
        });
      })
      .catch((err) => {
        console.log(err);
        return response.status(500).json({
          message: "Un erreur est survenu.",
        });
      });
  }

  public async listeFournisseurs(request: Request, response: Response) {
    const { page = 0, nom, contact, adresse } = request.query;

    const currentPage = Number(page);
    const maxPerPage = Number(process.env.MAX_PER_PAGE);

    const whereClause: any = {};

    if (nom) {
      whereClause.nom = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
        nom: `%${nom}%`,
      });
    }
    if (contact) {
      whereClause.contact = Raw(
        (alias) => `LOWER(${alias}) LIKE LOWER(:contact)`,
        { contact: `%${contact}%` }
      );
    }
    if (adresse) {
      whereClause.adresse = Raw(
        (alias) => `LOWER(${alias}) LIKE LOWER(:adresse)`,
        { adresse: `%${adresse}%` }
      );
    }

    /* ----------  NEW LOGIC  ---------- */
    let fournisseurs: Fournisseur[];
    let total: number;

    if (currentPage === 0) {
      // fetch all rows, no pagination
      [fournisseurs, total] = await fournisseurRepository.findAndCount({
        where: whereClause,
      });
    } else {
      // classic paginated fetch
      [fournisseurs, total] = await fournisseurRepository.findAndCount({
        skip: (currentPage - 1) * maxPerPage,
        take: maxPerPage,
        where: whereClause,
      });
    }
    /* ---------------------------------- */

    const totalPages = currentPage === 0 ? 1 : Math.ceil(total / maxPerPage);

    return response.json({
      fournisseurs,
      count: fournisseurs.length,
      totalPages,
      lastPage: currentPage === 0 ? true : currentPage >= totalPages,
    });
  }

  public async modifierFournisseur(request: Request, response: Response) {
    const data = request.body as ModifierFournisseur;

    fetchFournisseurs(data.code_fournisseur)
      .then((fournisseur) => {
        fournisseur.nom = data.nom;
        fournisseur.adresse = data.adresse;
        fournisseur.contact = data.contact;

        fournisseurRepository
          .save(fournisseur)
          .then(() => {
            response.json({
              message: "Fournisseur est modifié",
            });
          })
          .catch((err) => {
            console.log(err);
            response.status(500).json({
              message: "Un erreur est survenu.",
            });
          });
      })
      .catch((err) => {
        response.status(404).json({
          message: "Fournisseur n'est pas trouvé",
        });
      });
  }

  public async supprimerFournisseur(request: Request, response: Response) {
    const fournisseurId = Number(request.query.code_fournisseur);

    fournisseurRepository
      .delete(fournisseurId)
      .then(() => {
        return response.json({
          message: "Fournisseur est supprimé",
        });
      })
      .catch((err) => {
        console.log(err);

        return response.status(500).json({
          message: "Un erreur est survenu.",
        });
      });
  }
}
