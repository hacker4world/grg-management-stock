import { Request, Response } from "express";
import { CreateDemandeArticleDto } from "../dto/demande-article.dto";
import { ConfirmDenyDemandeDto } from "../dto/demande-article.dto";
import { ListDemandeFilters } from "../dto/demande-article.dto";
import { fetchDemandeArticle } from "../utilities/fetch.util";
import {
  demandeArticlesRepository,
  chantierRepository,
  articlesRepositoy,
  documentRepository,
} from "../repository/repositories";
import { DemandeArticle } from "../entity/DemandeArticle";
import { DemandeArticleItem } from "../entity/DemandeArticleItem";
import { Raw } from "typeorm";
import { CreateDemandeArticleValidator } from "../settings/validators/demande-article.validator";
import { generateFicheExpeditionForDemande } from "../utilities/pdf.util";

export class DemandeArticleService {
  public async createDemande(req: Request, res: Response) {
    const dto = req.body as CreateDemandeArticleDto;

    // 1. chantier must exist
    const chantier = await chantierRepository.findOneBy({
      code: dto.chantierId,
    });
    if (!chantier)
      return res.status(404).json({ message: "Chantier introuvable" });

    // 2. all articles must exist
    const articleIds = dto.items.map((i) => i.articleId);
    const articles = await articlesRepositoy.findByIds(articleIds);
    if (articles.length !== articleIds.length)
      return res
        .status(400)
        .json({ message: "Un ou plusieurs articles introuvables" });

    // 3. build entity graph
    const demande = demandeArticlesRepository.create({
      date: new Date().toISOString().slice(0, 10),
      chantier,
      status: "pending",
      observation: dto.observation || undefined,
    });
    await demandeArticlesRepository.save(demande);

    const items = dto.items.map((it) =>
      demandeArticlesRepository.manager.create(DemandeArticleItem, {
        demande,
        article: { id: it.articleId },
        quantite: it.quantity,
      }),
    );
    await demandeArticlesRepository.manager.save(DemandeArticleItem, items);

    return res
      .status(201)
      .json({ message: "Demande créée", demande: { ...demande, items } });
  }

  public async confirmOrDeny(req: Request, res: Response) {
    const { demandeId, action } = req.body as ConfirmDenyDemandeDto;
    // Auth and role (magazinier/admin) are enforced by middleware

    const demande = await fetchDemandeArticle(demandeId);
    if (!demande)
      return res.status(404).json({ message: "Demande introuvable" });

    if (action === "deny") {
      await demandeArticlesRepository.remove(demande);
      return res.json({ message: "Demande refusée et supprimée" });
    }

    // confirm – NO stock decrease here (stock is decreased when the Sortie is confirmed)
    demande.status = "confirmed";
    await demandeArticlesRepository.save(demande);

    // Génération de la Fiche d'Expédition
    const demandeWithRelations = await demandeArticlesRepository.findOne({
      where: { id: demande.id },
      relations: {
        chantier: true,
        items: { article: { unite: true } },
      },
    });

    if (!demandeWithRelations) {
      return res.json({
        message: "Demande confirmée",
        demande,
        documents: [],
      });
    }

    const feInfo =
      await generateFicheExpeditionForDemande(demandeWithRelations);
    const baseUrl = process.env.API_BASE_URL || "";

    const doc = documentRepository.create({
      type: feInfo.type,
      filename: feInfo.filename,
      originalName: feInfo.filename,
      path: feInfo.path,
      mimeType: "application/pdf",
      size: feInfo.size,
      entree: null,
      demandeArticle: demande,
      sortie: null,
    });
    await documentRepository.save(doc);

    return res.json({
      message: "Demande confirmée, Fiche d'Expédition générée",
      demande,
      documents: [
        {
          id: doc.id,
          type: doc.type,
          downloadUrl: `${baseUrl}/api/documents/${doc.id}/download`,
        },
      ],
    });
  }

  public async listDemandes(req: Request, res: Response) {
    const filters = req.query as ListDemandeFilters;
    const page = filters.page || 1;
    const max = Number(process.env.MAX_PER_PAGE) || 20;

    // Initialize a single where object to ensure AND logic
    const where: any = {};

    if (filters.chantierId) where.chantier = { code: filters.chantierId };
    if (filters.date) where.date = filters.date;
    if (filters.status) where.status = filters.status;

    // Add id filter - ignore if id = 0
    if (filters.id != undefined) {
      where.id = filters.id;
    }

    // Merge the article filter into the same object
    if (filters.articleId) {
      where.items = {
        article: { id: filters.articleId },
      };
    }

    const [demandes, total] = await demandeArticlesRepository.findAndCount({
      where: where,
      relations: {
        chantier: true,
        items: { article: true },
        documents: true,
      },
      order: { date: "DESC" },
      skip: (page - 1) * max,
      take: max,
    });

    res.json({
      demandes,
      count: demandes.length,
      totalPages: Math.ceil(total / max),
      lastPage: page >= Math.ceil(total / max),
    });
  }
}
