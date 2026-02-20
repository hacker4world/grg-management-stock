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
    if (!compte) return res.status(404).json({ message: "Compte introuvable" });

    if (!compte.confirme)
      return res.status(403).json({ message: "Compte non vérifié" });

    if (compte.role !== "responsable-chantier")
      return res.status(403).json({ message: "Rôle invalide" });

    const nouveau = chantierRepository.create({
      nom: data.nom,
      adresse: data.adresse,
      compte,
    });

    await chantierRepository.save(nouveau);
    res.json({ message: "Chantier est ajouté", chantier: nouveau });
  }

  public async listeChantiers(req: Request, res: Response) {
    const q = req.query;
    const page = q.page !== undefined ? Number(q.page) : 0; // Default to 0 (all)
    const max = Number(process.env.MAX_PER_PAGE) || 20;

    const where: any = {};
    if (q.query)
      where.nom = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
        nom: `%${q.query}%`,
      });
    if (q.adresse)
      where.adresse = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:adr)`, {
        adr: `%${q.adresse}%`,
      });
    if (q.code)
      where.code = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:code)`, {
        code: `%${q.code}%`,
      });
    if (q.compteId) where.compte = { id: Number(q.compteId) };

    const findOptions: any = {
      where,
      relations: { compte: true },
    };

    if (page !== 0) {
      findOptions.skip = (page - 1) * max;
      findOptions.take = max;
    }

    const [chantiers, total] =
      await chantierRepository.findAndCount(findOptions);

    res.json({
      chantiers,
      count: chantiers.length,
      totalPages: page === 0 ? 1 : Math.ceil(total / max),
      lastPage: page === 0 ? true : page >= Math.ceil(total / max),
    });
  }

  public async modifierChantier(req: Request, res: Response) {
    const data = req.body as ModifierChantierDto;
    const chantier = await fetchChantier(data.code_chantier);
    if (!chantier)
      return res.status(404).json({ message: "Chantier n'est pas trouvé" });

    if (data.compteId !== undefined) {
      const compte = await compteRepository.findOneBy({ id: data.compteId });
      if (!compte)
        return res.status(404).json({ message: "Compte introuvable" });
      chantier.compte = compte;
    }

    chantier.nom = data.nom;
    chantier.adresse = data.adresse;

    await chantierRepository.save(chantier);
    res.json({ message: "Chantier est modifié" });
  }

  public async supprimerChantier(req: Request, res: Response) {
    let { code_chantier } = req.query as any;

    code_chantier = Number(code_chantier);

    const exists = await chantierRepository.exist({
      where: { code: code_chantier },
    });

    if (!exists) {
      return res.status(404).json({ message: "Chantier introuvable" });
    }

    await chantierRepository.delete(code_chantier);
    res.json({ message: "Chantier est supprimé" });
  }

  public async affecterChantier(req: Request, res: Response) {
    const data = req.body as AffecterChantierDto;

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

    res.json({
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
    const compte = (req as AuthRequest).user!;
    const q = req.query;
    const page = q.page !== undefined ? Number(q.page) : 0;
    const max = Number(process.env.MAX_PER_PAGE) || 20;

    const where: any = {};
    if (compte.role !== "admin") where.compte = { id: compte.id };
    if (q.query) {
      where.nom = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
        nom: `%${q.query}%`,
      });
    }

    const findOptions: any = {
      where,
      relations: { compte: true },
    };

    if (page !== 0) {
      findOptions.skip = (page - 1) * max;
      findOptions.take = max;
    }

    const [chantiers, total] =
      await chantierRepository.findAndCount(findOptions);

    res.json({
      chantiers,
      count: chantiers.length,
      totalPages: page === 0 ? 1 : Math.ceil(total / max),
      lastPage: page === 0 ? true : page >= Math.ceil(total / max),
    });
  }

  public async getChantierSummary(req: Request, res: Response) {
    const { chantierId } = req.params;
    const code = Number(chantierId);

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

    res.json({
      chantier,
      summary: {
        sorties,
        demandes,
        retours,
      },
    });
  }

  /* ---------------------------------------------------- */
  /* STOCK PAR CHANTIER                                    */
  /* Returns articles available in a chantier:             */
  /*   delivered (confirmed sorties) - returned (confirmed */
  /*   + pending retours)                                  */
  /* ---------------------------------------------------- */
  public async getChantierStock(req: Request, res: Response) {
    const { chantierId } = req.params;
    const code = Number(chantierId);

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
          totalRetourne: confirmed, // only confirmed retours
          enAttenteRetour: pending, // pending retours shown separately
        });
      }
    }

    res.json({
      chantier: {
        code: chantier.code,
        nom: chantier.nom,
        adresse: chantier.adresse,
      },
      stock,
    });
  }
}
