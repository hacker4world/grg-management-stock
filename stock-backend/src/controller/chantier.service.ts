import { Request, Response } from "express";
import "dotenv/config";
import {
  AjouterChantierDto,
  ModifierChantierDto,
  SupprimerChantierDto,
  AffecterChantierDto,
} from "../dto/chantier.dto";
import { fetchChantier, fetchCompte } from "../utilities/fetch.util";
import { Chantier } from "../entity/Chantier";
import {
  chantierRepository,
  compteRepository,
  demandeArticlesRepository,
  retourArticleItemRepository,
  retourRepository,
  sortieRepository,
} from "../repository/repositories";
import { In, Raw } from "typeorm";
import { AuthRequest } from "../middleware";
import { RetourArticle } from "../entity/RetourArticle";
import { Article } from "../entity/Article";

export class ChantierService {
  public async creerChantier(req: Request, res: Response) {
    const data = req.body as AjouterChantierDto;

    const compte = await compteRepository.findOneBy({ id: data.compteId });
    if (!compte) {
      return res.status(404).json({ message: "Compte introuvable" });
    }

    if (!compte.confirme) {
      return res.status(403).json({ message: "Compte non vérifié" });
    }

    if (compte.role !== "responsable-chantier") {
      return res.status(403).json({ message: "Rôle invalide" });
    }

    const nouveau = chantierRepository.create({
      nom: data.nom.trim(),
      adresse: data.adresse.trim(),
      compte,
    });

    await chantierRepository.save(nouveau);
    return res.json({ message: "Chantier est ajouté", chantier: nouveau });
  }

  public async listeChantiers(req: Request, res: Response) {
    const q = req.query;
    const max = Number(process.env.MAX_PER_PAGE) || 20;

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
        where.adresse = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:adr)`, {
          adr: `%${searchTerm}%`,
        });
      }
    }
    // Code filter: exact match on numeric primary key (no LOWER)
    if (q.code) {
      const codeNum = Number(q.code);
      if (!isNaN(codeNum)) {
        where.code = codeNum;
      }
    }
    if (q.compteId) {
      const compteIdNum = Number(q.compteId);
      if (!isNaN(compteIdNum) && compteIdNum > 0) {
        where.compte = { id: compteIdNum };
      }
    }

    // Pagination validation
    let page = 0;
    let isPaginationDisabled = false;

    if (q.page !== undefined) {
      const pageNum = Number(q.page);
      if (isNaN(pageNum)) {
        return res.status(400).json({
          message: "Le paramètre 'page' doit être un nombre",
        });
      }
      page = pageNum;
      if (page === 0) {
        isPaginationDisabled = true;
      } else if (page < 1) {
        return res.status(400).json({
          message: "Le paramètre 'page' doit être supérieur ou égal à 0",
        });
      }
    } else {
      isPaginationDisabled = true;
    }

    const findOptions: any = {
      where,
      relations: { compte: true },
      order: { code: "DESC" },
    };

    if (!isPaginationDisabled) {
      findOptions.skip = (page - 1) * max;
      findOptions.take = max;
    }

    const [chantiers, total] =
      await chantierRepository.findAndCount(findOptions);

    const totalPages = isPaginationDisabled ? 1 : Math.ceil(total / max);
    const currentPage = isPaginationDisabled ? 1 : page;
    const lastPage = isPaginationDisabled ? true : currentPage >= totalPages;

    return res.json({
      chantiers,
      count: chantiers.length,
      total,
      currentPage,
      totalPages,
      lastPage,
    });
  }

  public async modifierChantier(req: Request, res: Response) {
    const data = req.body as ModifierChantierDto;

    // Validate ID
    if (!data.code_chantier || isNaN(Number(data.code_chantier))) {
      return res.status(400).json({ message: "Code chantier invalide" });
    }

    const chantier = await fetchChantier(data.code_chantier);
    if (!chantier) {
      return res.status(404).json({ message: "Chantier non trouvé" });
    }

    if (data.compteId !== undefined) {
      const compteIdNum = Number(data.compteId);
      if (isNaN(compteIdNum)) {
        return res.status(400).json({ message: "ID de compte invalide" });
      }
      const compte = await compteRepository.findOneBy({ id: compteIdNum });
      if (!compte) {
        return res.status(404).json({ message: "Compte introuvable" });
      }
      chantier.compte = compte;
    }

    if (data.nom !== undefined) chantier.nom = data.nom.trim();
    if (data.adresse !== undefined) chantier.adresse = data.adresse.trim();

    await chantierRepository.save(chantier);
    return res.json({ message: "Chantier modifié", chantier });
  }

  public async supprimerChantier(req: Request, res: Response) {
    let { code_chantier } = req.query;

    // Validate ID
    if (!code_chantier) {
      return res
        .status(400)
        .json({ message: "Le code chantier est obligatoire" });
    }
    if (Array.isArray(code_chantier)) {
      return res
        .status(400)
        .json({ message: "Un seul code chantier est autorisé" });
    }

    const codeNum = Number(code_chantier);
    if (isNaN(codeNum) || codeNum <= 0) {
      return res.status(400).json({ message: "Code chantier invalide" });
    }

    const exists = await chantierRepository.exist({ where: { code: codeNum } });
    if (!exists) {
      return res.status(404).json({ message: "Chantier introuvable" });
    }

    // Deletion allowed even if related entities exist (ON DELETE SET NULL / CASCADE)
    await chantierRepository.delete(codeNum);
    return res.json({ message: "Chantier supprimé" });
  }

  public async affecterChantier(req: Request, res: Response) {
    const data = req.body as AffecterChantierDto;

    // Validate IDs
    if (!data.code_chantier || isNaN(Number(data.code_chantier))) {
      return res.status(400).json({ message: "Code chantier invalide" });
    }
    if (!data.compte_id || isNaN(Number(data.compte_id))) {
      return res.status(400).json({ message: "ID de compte invalide" });
    }

    const chantier = await fetchChantier(data.code_chantier);
    if (!chantier) {
      return res.status(404).json({ message: "Chantier introuvable" });
    }

    const compte = await fetchCompte(data.compte_id);
    if (!compte) {
      return res.status(404).json({ message: "Compte introuvable" });
    }

    if (!compte.confirme) {
      return res.status(403).json({ message: "Le compte n'est pas vérifié" });
    }

    if (compte.role !== "responsable-chantier") {
      return res.status(403).json({
        message: "Le compte doit avoir le rôle 'responsable-chantier'",
      });
    }

    chantier.compte = compte;
    await chantierRepository.save(chantier);

    return res.json({
      message: "Chantier affecté avec succès",
      chantier: {
        code: chantier.code,
        nom: chantier.nom,
        adresse: chantier.adresse,
        compte: {
          id: compte.id,
          nom: compte.nom,
          prenom: compte.prenom,
          nom_utilisateur: compte.nom_utilisateur,
        },
      },
    });
  }

  public async getMesChantiers(req: Request, res: Response) {
    const compte = (req as AuthRequest).user;
    if (!compte) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const q = req.query;
    const max = Number(process.env.MAX_PER_PAGE) || 20;

    const where: any = {};
    if (compte.role !== "admin") {
      where.compte = { id: compte.id };
    }
    if (q.query && typeof q.query === "string") {
      const searchTerm = q.query.trim();
      if (searchTerm) {
        where.nom = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
          nom: `%${searchTerm}%`,
        });
      }
    }

    // Pagination validation
    let page = 0;
    let isPaginationDisabled = false;

    if (q.page !== undefined) {
      const pageNum = Number(q.page);
      if (isNaN(pageNum)) {
        return res.status(400).json({
          message: "Le paramètre 'page' doit être un nombre",
        });
      }
      page = pageNum;
      if (page === 0) {
        isPaginationDisabled = true;
      } else if (page < 1) {
        return res.status(400).json({
          message: "Le paramètre 'page' doit être supérieur ou égal à 0",
        });
      }
    } else {
      isPaginationDisabled = true;
    }

    const findOptions: any = {
      where,
      relations: { compte: true },
      order: { code: "DESC" },
    };

    if (!isPaginationDisabled) {
      findOptions.skip = (page - 1) * max;
      findOptions.take = max;
    }

    const [chantiers, total] =
      await chantierRepository.findAndCount(findOptions);

    const totalPages = isPaginationDisabled ? 1 : Math.ceil(total / max);
    const currentPage = isPaginationDisabled ? 1 : page;
    const lastPage = isPaginationDisabled ? true : currentPage >= totalPages;

    return res.json({
      chantiers,
      count: chantiers.length,
      total,
      currentPage,
      totalPages,
      lastPage,
    });
  }

  public async getChantierSummary(req: Request, res: Response) {
    const { chantierId } = req.params;
    const code = Number(chantierId);

    if (isNaN(code) || code <= 0) {
      return res.status(400).json({ message: "ID de chantier invalide" });
    }

    const chantier = await chantierRepository.findOne({
      where: { code },
      relations: { compte: true },
    });

    if (!chantier) {
      return res.status(404).json({ message: "Chantier introuvable" });
    }

    // Fetch all related movements
    const sorties = await sortieRepository.find({
      where: { chantier: { code } },
      relations: ["articleSorties", "articleSorties.article", "compte"],
    });

    const demandes = await demandeArticlesRepository.find({
      where: { chantier: { code } },
      relations: ["items", "items.article"],
    });

    const retours = await retourRepository.find({
      where: { chantier: { code } },
      relations: ["items", "items.article"],
    });

    return res.json({
      chantier,
      summary: {
        sorties,
        demandes,
        retours,
      },
    });
  }

  public async getChantierStock(req: Request, res: Response) {
    const { chantierId } = req.params;
    const code = Number(chantierId);

    if (isNaN(code) || code <= 0) {
      return res.status(400).json({ message: "ID de chantier invalide" });
    }

    // 1. Verify chantier exists
    const chantier = await chantierRepository.findOneBy({ code });
    if (!chantier) {
      return res.status(404).json({ message: "Chantier introuvable" });
    }

    // 2. Get all confirmed sorties (deliveries) for this chantier
    const sorties = await sortieRepository.find({
      where: { chantier: { code }, status: "confirmed" },
      relations: [
        "articleSorties",
        "articleSorties.article",
        "articleSorties.article.unite",
        "articleSorties.article.categorie",
        "articleSorties.article.depot",
      ],
    });

    // 3. Get retours for this chantier (separate confirmed vs pending)
    const retours = await retourRepository.find({
      where: { chantier: { code }, status: In(["confirmed", "pending"]) },
      relations: ["items", "items.article"],
    });

    // 4. Calculate total delivered per article
    const deliveredMap = new Map<
      number,
      { article: Article; delivered: number }
    >();
    for (const sortie of sorties) {
      for (const as of sortie.articleSorties) {
        if (!as.article) continue; // safety
        const existing = deliveredMap.get(as.article.id);
        if (existing) {
          existing.delivered += Number(as.stockSortie);
        } else {
          deliveredMap.set(as.article.id, {
            article: as.article,
            delivered: Number(as.stockSortie),
          });
        }
      }
    }

    // 5. Calculate returned per article: split confirmed vs pending
    const confirmedReturnMap = new Map<number, number>();
    const pendingReturnMap = new Map<number, number>();
    for (const retour of retours) {
      const targetMap =
        retour.status === "confirmed" ? confirmedReturnMap : pendingReturnMap;
      for (const item of retour.items) {
        if (!item.article) continue;
        const prev = targetMap.get(item.article.id) || 0;
        targetMap.set(item.article.id, prev + Number(item.quantite));
      }
    }

    // 6. Build result: only articles with available stock > 0
    const stock: {
      article: Article;
      quantiteDisponible: number;
      totalLivre: number;
      totalRetourne: number;
      enAttenteRetour: number;
    }[] = [];

    for (const [articleId, { article, delivered }] of deliveredMap) {
      const confirmed = confirmedReturnMap.get(articleId) || 0;
      const pending = pendingReturnMap.get(articleId) || 0;
      const available = delivered - confirmed - pending;
      if (available > 0) {
        stock.push({
          article,
          quantiteDisponible: available,
          totalLivre: delivered,
          totalRetourne: confirmed,
          enAttenteRetour: pending,
        });
      }
    }

    return res.json({
      chantier: {
        code: chantier.code,
        nom: chantier.nom,
        adresse: chantier.adresse,
      },
      stock,
    });
  }
}
