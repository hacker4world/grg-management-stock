import { Request, Response } from "express";
import "dotenv/config";
import {
  AjouterFournisseurDto,
  ModifierFournisseur,
  SupprimerFournisseur,
} from "../dto/famille.dto";
import { Fournisseur } from "../entity/Fournisseur";
import {
  entreeRepository,
  fournisseurRepository,
} from "../repository/repositories";
import { fetchFournisseurs } from "../utilities/fetch.util";
import { Raw } from "typeorm";

export class FournisseurService {
  public async creerFournisseur(request: Request, response: Response) {
    const fournisseurData = request.body as AjouterFournisseurDto;

    const nouveauFournisseur = fournisseurRepository.create({
      nom: fournisseurData.nom.trim(),
      adresse: fournisseurData.adresse.trim(),
      contact: fournisseurData.contact.trim(),
    });

    await fournisseurRepository.save(nouveauFournisseur);
    return response.status(201).json({
      message: "Fournisseur ajouté.",
      fournisseur: nouveauFournisseur,
    });
  }

  public async listeFournisseurs(request: Request, response: Response) {
    const { page = "0", nom, contact, adresse } = request.query;
    const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;

    // Build where clause
    const whereClause: any = {};

    if (nom && typeof nom === "string") {
      const searchTerm = nom.trim();
      if (searchTerm) {
        whereClause.nom = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
          nom: `%${searchTerm}%`,
        });
      }
    }
    if (contact && typeof contact === "string") {
      const searchTerm = contact.trim();
      if (searchTerm) {
        whereClause.contact = Raw(
          (alias) => `LOWER(${alias}) LIKE LOWER(:contact)`,
          {
            contact: `%${searchTerm}%`,
          },
        );
      }
    }
    if (adresse && typeof adresse === "string") {
      const searchTerm = adresse.trim();
      if (searchTerm) {
        whereClause.adresse = Raw(
          (alias) => `LOWER(${alias}) LIKE LOWER(:adresse)`,
          {
            adresse: `%${searchTerm}%`,
          },
        );
      }
    }

    // Pagination validation
    let currentPage: number;
    let isPaginationDisabled = false;

    if (page === "0") {
      isPaginationDisabled = true;
      currentPage = 1; // not used
    } else {
      currentPage = Number(page);
      if (isNaN(currentPage) || currentPage < 1) {
        return response.status(400).json({
          message: "Le paramètre 'page' doit être un nombre positif",
        });
      }
      currentPage = Math.floor(currentPage);
    }

    let fournisseurs: Fournisseur[];
    let total: number;

    if (isPaginationDisabled) {
      [fournisseurs, total] = await fournisseurRepository.findAndCount({
        where: whereClause,
        order: { code: "DESC" },
      });
    } else {
      [fournisseurs, total] = await fournisseurRepository.findAndCount({
        skip: (currentPage - 1) * maxPerPage,
        take: maxPerPage,
        where: whereClause,
        order: { code: "DESC" },
      });
    }

    const totalPages = isPaginationDisabled ? 1 : Math.ceil(total / maxPerPage);
    const lastPage = isPaginationDisabled ? true : currentPage >= totalPages;

    return response.json({
      fournisseurs,
      total,
      count: fournisseurs.length,
      currentPage: isPaginationDisabled ? 1 : currentPage,
      totalPages,
      lastPage,
    });
  }

  public async modifierFournisseur(request: Request, response: Response) {
    const data = request.body as ModifierFournisseur;

    // Validate ID
    if (!data.code_fournisseur || isNaN(Number(data.code_fournisseur))) {
      return response
        .status(400)
        .json({ message: "Code fournisseur invalide" });
    }

    const fournisseur = await fournisseurRepository.findOneBy({
      code: data.code_fournisseur,
    });
    if (!fournisseur) {
      return response.status(404).json({ message: "Fournisseur non trouvé" });
    }

    // Check for duplicate name (excluding current)
    if (data.nom && data.nom.trim() !== fournisseur.nom) {
      const existing = await fournisseurRepository.findOneBy({
        nom: data.nom.trim(),
      });
      if (existing && existing.code !== fournisseur.code) {
        return response
          .status(409)
          .json({ message: "Un fournisseur avec ce nom existe déjà" });
      }
      fournisseur.nom = data.nom.trim();
    }

    if (data.adresse !== undefined) {
      fournisseur.adresse = data.adresse.trim();
    }
    if (data.contact !== undefined) {
      fournisseur.contact = data.contact.trim();
    }

    await fournisseurRepository.save(fournisseur);
    return response.json({
      message: "Fournisseur modifié",
      fournisseur,
    });
  }

  public async supprimerFournisseur(request: Request, response: Response) {
    const { code_fournisseur } = request.query;

    // Validate ID
    if (!code_fournisseur) {
      return response
        .status(400)
        .json({ message: "Le code fournisseur est obligatoire" });
    }
    if (Array.isArray(code_fournisseur)) {
      return response
        .status(400)
        .json({ message: "Un seul code fournisseur est autorisé" });
    }

    const idNum = Number(code_fournisseur);
    if (isNaN(idNum) || idNum <= 0) {
      return response
        .status(400)
        .json({ message: "Code fournisseur invalide" });
    }

    // Check if supplier exists
    const exists = await fournisseurRepository.exist({
      where: { code: idNum },
    });
    if (!exists) {
      return response.status(404).json({ message: "Fournisseur non trouvé" });
    }

    await fournisseurRepository.delete(idNum);
    return response.json({ message: "Fournisseur supprimé" });
  }
}
