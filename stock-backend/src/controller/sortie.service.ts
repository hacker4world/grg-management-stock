// services/sortie.service.ts
import { Request, Response } from "express";
import { Sortie, SortieType, SortieExterneType } from "../entity/Sortie";
import { ArticleSortie } from "../entity/ArticleSortie";
import { Article } from "../entity/Article";
import { Chantier } from "../entity/Chantier";
import {
  sortieRepository,
  articleSortieRepository,
  articlesRepositoy,
  chantierRepository,
  compteRepository,
  documentRepository,
  depotRepository,
} from "../repository/repositories";
import { In } from "typeorm";
import {
  CreateSortieDto,
  ListSortiesFilterDto,
  ConfirmDenySortieDto,
} from "../dto/sortie.dto";
import { Depot } from "../entity/Depot";
import { Role } from "../enums/role.enum";
import { checkAndCreateStockNotification } from "../utilities/notification.util";
import {
  generateFicheExpeditionForSortie,
  generateBonDeLivraisonForSortie,
} from "../utilities/pdf.util";

export class SortieService {
  /**
   * Create a new sortie with type-specific validation and field handling
   */
  public async createSortie(req: Request, res: Response) {
    try {
      const dto = req.body as CreateSortieDto;

      // ============ VALIDATE COMPTE ============
      const compte = await compteRepository.findOneBy({
        id: dto.compteId,
      });

      if (!compte) {
        return res.status(400).json({
          message: "Compte introuvable",
        });
      }

      const allowedRoles: string[] = [Role.ADMIN, Role.ADMIN1, Role.MAGAZINIER];
      if (!allowedRoles.includes(compte.role)) {
        return res.status(400).json({
          message: "Le compte doit être un admin ou un magazinier",
        });
      }

      // Edge case: validate articles array exists and has items
      if (!dto.articles || dto.articles.length === 0) {
        return res.status(400).json({ message: "Aucun article spécifié" });
      }

      // Edge case: validate each article has valid data
      for (const item of dto.articles) {
        if (!item.articleId || isNaN(Number(item.articleId))) {
          return res.status(400).json({ message: "ID d'article invalide" });
        }
        if (
          !item.stockSortie ||
          isNaN(Number(item.stockSortie)) ||
          Number(item.stockSortie) <= 0
        ) {
          return res
            .status(400)
            .json({
              message: `Quantité invalide pour l'article ${item.articleId}`,
            });
        }
      }

      // ============ BUILD SORTIE BASED ON TYPE ============
      const sortie = await this.buildSortieByType(dto, compte, res);
      if (!sortie) return; // Error already sent

      await sortieRepository.save(sortie);

      // ============ CREATE ARTICLE LINES ============
      const lines: ArticleSortie[] = [];
      for (const l of dto.articles) {
        const article = await articlesRepositoy.findOneBy({ id: l.articleId });
        if (!article) {
          // Cleanup: remove the sortie if article not found
          await sortieRepository.remove(sortie);
          return res
            .status(404)
            .json({ message: `Article ${l.articleId} inconnu` });
        }

        lines.push(
          articleSortieRepository.create({
            sortie,
            article,
            stockSortie: l.stockSortie,
          }),
        );
      }
      await articleSortieRepository.save(lines);

      // ============ RELOAD WITH RELATIONS ============
      const fresh = await sortieRepository.findOne({
        where: { id: sortie.id },
        relations: {
          chantier: true,
          depot: true,
          compte: true,
          articleSorties: { article: true },
        },
      });

      return res.status(201).json({
        message: "Sortie créée",
        sortie: fresh,
      });
    } catch (error: any) {
      console.error("🔴 createSortie error:", error?.message || error);
      if (error?.stack) console.error(error.stack);
      return res.status(500).json({
        message: "Erreur lors de la création de la sortie",
        detail: error?.message,
      });
    }
  }

  private async buildSortieByType(
    dto: CreateSortieDto,
    compte: any,
    res: Response,
  ): Promise<Sortie | null> {
    const baseFields = {
      date: dto.date,
      observation: dto.observation || null,
      status: "pending" as const,
      compte,
    };

    // ============ SORTIE INTERNE DEPOT ============
    if (dto.typeSortie === "interne_depot") {
      // Edge case: validate depotId is a valid number
      if (!dto.depotId || isNaN(Number(dto.depotId))) {
        res.status(400).json({ message: "ID de dépôt invalide" });
        return null;
      }

      const depot = await depotRepository.findOneBy({
        id: dto.depotId,
      });
      if (!depot) {
        res.status(404).json({ message: "Dépôt introuvable" });
        return null;
      }

      return sortieRepository.create({
        ...baseFields,
        typeSortie: "interne_depot",
        depot,
        nomTransporteurDepot: dto.nomTransporteur,
        matriculeTransporteurDepot: dto.matriculeTransporteur,
        chantier: null,
        sousTypeSortieExterne: null,
        nomEntreprise: null,
        adresseEntreprise: null,
        matriculeFiscalEntreprise: null,
        nomClient: null,
        nomTransporteurExterne: null,
        matriculeTransporteurExterne: null,
      });
    }

    if (dto.typeSortie === "interne_chantier") {
      // Edge case: validate chantierId is a valid number
      if (!dto.chantierId || isNaN(Number(dto.chantierId))) {
        res.status(400).json({ message: "ID de chantier invalide" });
        return null;
      }

      const chantier = await chantierRepository.findOneBy({
        code: dto.chantierId,
      });
      if (!chantier) {
        res.status(404).json({ message: "Chantier introuvable" });
        return null;
      }

      return sortieRepository.create({
        ...baseFields,
        typeSortie: "interne_chantier",
        chantier,
        nomTransporteurChantier: dto.nomTransporteur,
        matriculeTransporteurChantier: dto.matriculeTransporteur,
        depot: null,
        sousTypeSortieExterne: null,
        nomEntreprise: null,
        adresseEntreprise: null,
        matriculeFiscalEntreprise: null,
        nomClient: null,
        nomTransporteurExterne: null,
        matriculeTransporteurExterne: null,
      });
    }

    // ============ SORTIE EXTERNE ============
    if (dto.typeSortie === "externe") {
      // Edge case: validate sousTypeSortieExterne
      if (!dto.sousTypeSortieExterne) {
        res.status(400).json({ message: "Sous-type de sortie externe requis" });
        return null;
      }

      const sortieExterne = sortieRepository.create({
        ...baseFields,
        typeSortie: "externe",
        sousTypeSortieExterne: dto.sousTypeSortieExterne,
        nomEntreprise: dto.nomEntreprise,
        adresseEntreprise: dto.adresseEntreprise,
        matriculeFiscalEntreprise: dto.matriculeFiscalEntreprise,
        nomClient: dto.nomClient,
        depot: null,
        chantier: null,
      });

      // Add transporteur fields if "avec_transporteur"
      if (dto.sousTypeSortieExterne === "avec_transporteur") {
        sortieExterne.nomTransporteurExterne = dto.nomTransporteur;
        sortieExterne.matriculeTransporteurExterne = dto.matriculeTransporteur;
      } else {
        sortieExterne.nomTransporteurExterne = null;
        sortieExterne.matriculeTransporteurExterne = null;
      }

      return sortieExterne;
    }

    res.status(400).json({ message: "Type de sortie invalide" });
    return null;
  }

  public async listSorties(req: Request, res: Response) {
    const q = req.query as ListSortiesFilterDto;

    // Edge case: validate page is a valid number
    const page = q.page !== undefined ? Number(q.page) : 1;
    if (isNaN(page) || page < 1) {
      return res.status(400).json({ message: "Page invalide" });
    }

    const max = Number(process.env.MAX_PER_PAGE) || 20;

    const where: any = {
      status: "pending",
    };

    if (q.date) where.date = q.date;
    if (q.typeSortie) where.typeSortie = q.typeSortie;

    // Edge case: validate chantierId is a valid number
    if (q.chantierId) {
      const chantierIdNum = Number(q.chantierId);
      if (!isNaN(chantierIdNum) && chantierIdNum > 0) {
        where.chantier = { code: chantierIdNum };
      }
    }

    // Edge case: validate depotId is a valid number
    if (q.depotId) {
      const depotIdNum = Number(q.depotId);
      if (!isNaN(depotIdNum) && depotIdNum > 0) {
        where.depot = { id: depotIdNum };
      }
    }

    // Edge case: validate compteId is a valid number
    if (q.compteId) {
      const compteIdNum = Number(q.compteId);
      if (!isNaN(compteIdNum) && compteIdNum > 0) {
        where.compte = { id: compteIdNum };
      }
    }

    // Edge case: validate id is a valid number
    if (q.id != undefined) {
      const idNum = Number(q.id);
      if (!isNaN(idNum)) {
        where.id = idNum;
      }
    }

    // ============ FILTER BY ARTICLE ID ============
    let articleFilter: number[] | undefined;
    if (q.articleId) {
      const articleIdNum = Number(q.articleId);
      if (!isNaN(articleIdNum) && articleIdNum > 0) {
        const rows = await articleSortieRepository.find({
          where: { article: { id: articleIdNum } },
          select: { sortie: { id: true } },
          relations: { sortie: true },
        });
        articleFilter = rows.map((r) => r.sortie?.id);
        if (!articleFilter.length) {
          return res.json({
            sorties: [],
            count: 0,
            totalPages: 0,
            lastPage: true,
          });
        }
        where.id = In(articleFilter);
      }
    }

    // ============ FILTER BY STOCK SORTIE ============
    let stockSortieFilter: number | undefined;
    if (q.stockSortie) {
      stockSortieFilter = Number(q.stockSortie);
      if (!isNaN(stockSortieFilter)) {
        const rows = await articleSortieRepository.find({
          where: { stockSortie: stockSortieFilter },
          select: { sortie: { id: true } },
          relations: { sortie: true },
        });
        const sortieIds = rows.map((r) => r.sortie.id);
        if (!sortieIds.length) {
          return res.json({
            sorties: [],
            count: 0,
            totalPages: 0,
            lastPage: true,
          });
        }
        where.id = In(sortieIds);
      }
    }

    // ============ FETCH SORTIES ============
    const [sorties, total] = await sortieRepository.findAndCount({
      where,
      relations: {
        chantier: true,
        depot: true,
        compte: true,
        articleSorties: { article: true },
      },
      order: { date: "DESC", id: "DESC" },
      skip: (page - 1) * max,
      take: max,
    });

    // Filter article lines if stockSortie filter was applied
    if (stockSortieFilter !== undefined) {
      sorties.forEach((s) => {
        if (s.articleSorties) {
          s.articleSorties = s.articleSorties.filter(
            (l) => l.stockSortie === stockSortieFilter,
          );
        }
      });
    }

    res.json({
      sorties,
      count: sorties.length,
      totalPages: Math.ceil(total / max),
      currentPage: page,
      lastPage: page >= Math.ceil(total / max),
    });
  }

  /**
   * List confirmed sorties with filtering
   */
  public async listConfirmedSorties(req: Request, res: Response) {
    return this.fetchSortiesByStatus(req, res, "confirmed");
  }

  /**
   * Fetch sorties by status with multi-criteria filtering
   */
  private async fetchSortiesByStatus(
    req: Request,
    res: Response,
    status: "pending" | "confirmed",
  ) {
    const q = req.query as ListSortiesFilterDto;

    // Edge case: validate page is a valid number
    const page = q.page !== undefined ? Number(q.page) : 1;
    if (isNaN(page) || page < 1) {
      return res.status(400).json({ message: "Page invalide" });
    }

    const max = Number(process.env.MAX_PER_PAGE) || 20;

    const where: any = { status };

    if (q.date) where.date = q.date;
    if (q.typeSortie) where.typeSortie = q.typeSortie;

    // Edge case: validate chantierId is a valid number
    if (q.chantierId) {
      const chantierIdNum = Number(q.chantierId);
      if (!isNaN(chantierIdNum) && chantierIdNum > 0) {
        where.chantier = { code: chantierIdNum };
      }
    }

    // Edge case: validate depotId is a valid number
    if (q.depotId) {
      const depotIdNum = Number(q.depotId);
      if (!isNaN(depotIdNum) && depotIdNum > 0) {
        where.depot = { id: depotIdNum };
      }
    }

    // Edge case: validate compteId is a valid number
    if (q.compteId) {
      const compteIdNum = Number(q.compteId);
      if (!isNaN(compteIdNum) && compteIdNum > 0) {
        where.compte = { id: compteIdNum };
      }
    }

    // Edge case: validate id is a valid number
    if (q.id != undefined) {
      const idNum = Number(q.id);
      if (!isNaN(idNum)) {
        where.id = idNum;
      }
    }

    // ============ HANDLE ARTICLE FILTERING ============
    if (q.articleId) {
      const articleIdNum = Number(q.articleId);
      if (!isNaN(articleIdNum) && articleIdNum > 0) {
        const articleLines = await articleSortieRepository.find({
          where: { article: { id: articleIdNum } },
          relations: { sortie: true },
        });

        const validIds = articleLines.map((line) => line.sortie?.id);

        if (validIds.length === 0) {
          return res.json(this.emptyResponse());
        }

        where.id = In(validIds);
      }
    }

    // ============ EXECUTE QUERY ============
    const [sorties, total] = await sortieRepository.findAndCount({
      where,
      relations: {
        chantier: true,
        depot: true,
        compte: true,
        articleSorties: { article: true },
        documents: status === "confirmed",
      },
      order: { date: "DESC", id: "DESC" },
      skip: (page - 1) * max,
      take: max,
    });

    const totalPages = Math.ceil(total / max);

    return res.json({
      sorties,
      count: total,
      totalPages,
      currentPage: page,
      lastPage: page >= totalPages,
    });
  }

  private emptyResponse() {
    return {
      sorties: [],
      count: 0,
      totalPages: 0,
      lastPage: true,
    };
  }

  /**
   * Confirm or deny a pending sortie
   */
  public async confirmDenySortie(req: Request, res: Response) {
    const dto = req.body as ConfirmDenySortieDto;

    // Edge case: validate sortieId is a valid number
    const sortieIdNum = Number(dto.sortieId);
    if (isNaN(sortieIdNum) || sortieIdNum <= 0) {
      return res.status(400).json({ message: "ID de sortie invalide" });
    }

    const sortie = await sortieRepository.findOne({
      where: { id: sortieIdNum },
      relations: { articleSorties: { article: true } },
    });

    if (!sortie) {
      return res.status(404).json({ message: "Sortie introuvable" });
    }

    if (sortie.status !== "pending") {
      return res.status(400).json({ message: "Sortie déjà traitée" });
    }

    // ============ DENY ACTION ============
    if (dto.action === "deny") {
      await sortieRepository.remove(sortie);
      return res.json({ message: "Sortie refusée et supprimée" });
    }

    // ============ CONFIRM ACTION - DECREMENT STOCK ============
    const updatedArticles: (typeof sortie.articleSorties)[0]["article"][] = [];

    // Edge case: check if articleSorties exists before iterating
    if (sortie.articleSorties && sortie.articleSorties.length > 0) {
      for (const line of sortie.articleSorties) {
        const article = line.article;
        // Edge case: check if article exists
        if (!article) continue;

        if (article.stockActuel < line.stockSortie) {
          return res.status(409).json({
            message: `Stock insuffisant pour article ${article.nom}`,
          });
        }
        article.stockActuel =
          Number(article.stockActuel) - Number(line.stockSortie);
        await articlesRepositoy.save(article);
        updatedArticles.push(article);
      }
    }

    sortie.status = "confirmed";
    await sortieRepository.save(sortie);

    // ============ CREATE STOCK NOTIFICATIONS ============
    const notifications = [];
    for (const article of updatedArticles) {
      const notification = await checkAndCreateStockNotification(article);
      if (notification) {
        notifications.push({
          id: notification.id,
          type: notification.type,
          message: notification.message,
        });
      }
    }

    // ============ GENERATE PDF DOCUMENT ============
    const sortieWithRelations = await sortieRepository.findOne({
      where: { id: sortie.id },
      relations: {
        chantier: true,
        depot: true,
        articleSorties: { article: { unite: true } },
      },
    });

    let documents: { id: number; type: string; downloadUrl: string }[] = [];
    let pdfLabel = "";

    if (sortieWithRelations) {
      const isInterne = sortieWithRelations.typeSortie !== "externe";
      const pdfInfo = isInterne
        ? await generateFicheExpeditionForSortie(sortieWithRelations)
        : await generateBonDeLivraisonForSortie(sortieWithRelations);

      pdfLabel = isInterne ? "Fiche d'Expédition" : "Bon de Livraison";
      const baseUrl = process.env.API_BASE_URL || "";

      const doc = documentRepository.create({
        type: pdfInfo.type,
        filename: pdfInfo.filename,
        originalName: pdfInfo.filename,
        path: pdfInfo.path,
        mimeType: "application/pdf",
        size: pdfInfo.size,
        entree: null,
        demandeArticle: null,
        sortie: sortie,
      });
      await documentRepository.save(doc);

      documents = [
        {
          id: doc.id,
          type: doc.type,
          downloadUrl: `${baseUrl}/api/documents/${doc.id}/download`,
        },
      ];
    }

    res.json({
      message: `Sortie confirmée, stock mis à jour, ${pdfLabel || "document"} généré`,
      sortie,
      documents,
      stockAlerts: notifications.length > 0 ? notifications : undefined,
    });
  }

  /**
   * Delete a sortie
   */
  public async deleteSortie(req: Request, res: Response) {
    // Edge case: validate id is a valid number
    const id = req.query.id ? Number(req.query.id) : 0;
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "ID de sortie invalide" });
    }

    const sortie = await sortieRepository.findOneBy({ id });

    if (!sortie) {
      return res.status(404).json({ message: "Sortie introuvable" });
    }

    await sortieRepository.remove(sortie);

    return res.json({ message: "Sortie supprimée avec succès" });
  }
}
