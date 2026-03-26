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

    // Create new manufacturer (duplicate names allowed)
    const nouveauFabriquant = fabriquantRepository.create({
      nom: data.nom.trim(),
      adresse: data.adresse.trim(),
      contact: data.contact.trim(),
    });

    await fabriquantRepository.save(nouveauFabriquant);

    return response.json({
      message: "Fabriquant est ajouté",
      fabriquant: nouveauFabriquant,
    });
  }

  public async listeFabriquants(request: Request, response: Response) {
    const q = request.query;
    const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;

    // Build where clause
    const where: any = {};

    if (q.query && typeof q.query === "string") {
      const searchTerm = q.query.trim();
      if (searchTerm) {
        where.nom = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
          nom: `%${searchTerm}%`,
        });
      }
    }
    if (q.adresse && typeof q.adresse === "string") {
      const searchTerm = q.adresse.trim();
      if (searchTerm) {
        where.adresse = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:adresse)`, {
          adresse: `%${searchTerm}%`,
        });
      }
    }
    if (q.contact && typeof q.contact === "string") {
      const searchTerm = q.contact.trim();
      if (searchTerm) {
        where.contact = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:contact)`, {
          contact: `%${searchTerm}%`,
        });
      }
    }
    if (q.code) {
      const codeNum = Number(q.code);
      if (!isNaN(codeNum)) {
        where.code = codeNum;
      }
    }

    // Pagination validation
    let page: number;
    let isPaginationDisabled = false;

    if (!q.page || q.page === "0") {
      isPaginationDisabled = true;
      page = 1; // not used
    } else {
      page = Number(q.page);
      if (isNaN(page) || page < 1) {
        return response.status(400).json({
          message: "Le paramètre 'page' doit être un nombre positif",
        });
      }
      page = Math.floor(page);
    }

    let fabriquants: Fabriquant[];
    let total: number;

    if (isPaginationDisabled) {
      [fabriquants, total] = await fabriquantRepository.findAndCount({
        where,
        order: { code: "DESC" },
      });
    } else {
      [fabriquants, total] = await fabriquantRepository.findAndCount({
        skip: (page - 1) * maxPerPage,
        take: maxPerPage,
        where,
        order: { code: "DESC" },
      });
    }

    const totalPages = isPaginationDisabled ? 1 : Math.ceil(total / maxPerPage);
    const currentPage = isPaginationDisabled ? 1 : page;
    const lastPage = isPaginationDisabled ? true : currentPage >= totalPages;

    return response.json({
      fabriquants,
      total,
      count: fabriquants.length,
      currentPage,
      totalPages,
      lastPage,
    });
  }

  public async modifierFabriquant(request: Request, response: Response) {
    const data = request.body as ModifierFabriquantDto;

    // Validate ID
    if (!data.code_fabriquant || isNaN(Number(data.code_fabriquant))) {
      return response.status(400).json({ message: "Code fabriquant invalide" });
    }

    const fabriquant = await fabriquantRepository.findOneBy({
      code: data.code_fabriquant,
    });
    if (!fabriquant) {
      return response.status(404).json({ message: "Fabriquant non trouvé" });
    }

    // Update fields (duplicate names allowed)
    if (data.nom !== undefined) {
      fabriquant.nom = data.nom.trim();
    }
    if (data.adresse !== undefined) {
      fabriquant.adresse = data.adresse.trim();
    }
    if (data.contact !== undefined) {
      fabriquant.contact = data.contact.trim();
    }

    await fabriquantRepository.save(fabriquant);
    return response.json({
      message: "Fabriquant modifié",
      fabriquant,
    });
  }

  public async supprimerFabriquant(request: Request, response: Response) {
    const { code } = request.query;

    // Validate ID
    if (!code) {
      return response.status(400).json({
        message: "Le code du fabriquant est obligatoire",
      });
    }
    if (Array.isArray(code)) {
      return response.status(400).json({
        message: "Un seul code fabriquant est autorisé",
      });
    }

    const idNum = Number(code);
    if (isNaN(idNum) || idNum <= 0) {
      return response.status(400).json({
        message: "Code fabriquant invalide",
      });
    }

    // Check existence
    const exists = await fabriquantRepository.exist({ where: { code: idNum } });
    if (!exists) {
      return response.status(404).json({ message: "Fabriquant non trouvé" });
    }

    // Delete even if entries exist (orphan allowed)
    await fabriquantRepository.delete(idNum);
    return response.json({ message: "Fabriquant supprimé" });
  }
}
