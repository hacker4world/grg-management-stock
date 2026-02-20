/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import {
  retourRepository,
  chantierRepository,
  articlesRepositoy,
  retourArticleItemRepository,
  documentRepository,
  sortieRepository,
} from "../repository/repositories";
import {
  CreateRetourDto,
  ListRetoursDto,
  ApproveDenyRetourDto,
} from "../dto/retour.dto";
import { In, Raw, DataSource } from "typeorm";
import { RetourArticle } from "../entity/RetourArticle";
import { RetourArticleItem } from "../entity/RetourArticleItem";
import { AppDataSource } from "../data-source"; // <-- central DS export
import { generateBonDeRetourForRetour } from "../utilities/pdf.util";

/* ---- helper: compute available stock per article in a chantier ---- */
async function getChantierAvailableStock(
  chantierCode: number,
): Promise<Map<number, number>> {
  // Confirmed sorties → delivered
  const sorties = await sortieRepository.find({
    where: { chantier: { code: chantierCode }, status: "confirmed" },
    relations: ["articleSorties", "articleSorties.article"],
  });

  const deliveredMap = new Map<number, number>();
  for (const s of sorties) {
    for (const as of s.articleSorties) {
      const prev = deliveredMap.get(as.article.id) || 0;
      deliveredMap.set(as.article.id, prev + Number(as.stockSortie));
    }
  }

  // Confirmed + pending retours → already returned
  const retours = await retourRepository.find({
    where: {
      chantier: { code: chantierCode },
      status: In(["confirmed", "pending"]),
    },
    relations: ["items", "items.article"],
  });

  const returnedMap = new Map<number, number>();
  for (const r of retours) {
    for (const item of r.items) {
      const prev = returnedMap.get(item.article.id) || 0;
      returnedMap.set(item.article.id, prev + Number(item.quantite));
    }
  }

  // available = delivered - returned
  const availableMap = new Map<number, number>();
  for (const [articleId, delivered] of deliveredMap) {
    const returned = returnedMap.get(articleId) || 0;
    const available = delivered - returned;
    if (available > 0) {
      availableMap.set(articleId, available);
    }
  }

  return availableMap;
}

export class RetourService {
  /* ---------------------------------------------------- */
  /* 1. CREATE                                             */
  /* ---------------------------------------------------- */
  public async createRetour(req: Request, res: Response) {
    const dto = req.body as CreateRetourDto;

    // 1. chantier exists ?
    const chantier = await chantierRepository.findOneBy({
      code: dto.chantierId,
    });
    if (!chantier)
      return res.status(404).json({ message: "Chantier introuvable" });

    // 2. articles exist ?
    const articleIds = dto.items.map((i) => i.articleId);
    const articles = await articlesRepositoy.findBy({ id: In(articleIds) });
    if (articles.length !== articleIds.length)
      return res
        .status(400)
        .json({ message: "Un ou plusieurs articles introuvables" });

    // 3. validate: articles must be available in the chantier with sufficient qty
    const availableStock = await getChantierAvailableStock(dto.chantierId);

    for (const item of dto.items) {
      const available = availableStock.get(item.articleId) || 0;
      const articleName =
        articles.find((a) => a.id === item.articleId)?.nom ||
        `#${item.articleId}`;

      if (available <= 0) {
        return res.status(400).json({
          message: `L'article "${articleName}" n'est pas disponible dans ce chantier`,
        });
      }
      if (item.quantite > available) {
        return res.status(400).json({
          message: `Quantité insuffisante pour "${articleName}": demandé ${item.quantite}, disponible ${available}`,
        });
      }
    }

    // 4. build entities
    const retour = retourRepository.create({
      date: new Date().toISOString().slice(0, 10),
      chantier,
      status: "pending",
      observation: dto.observation,
    });
    await retourRepository.save(retour);

    const items = dto.items.map((it) =>
      retourArticleItemRepository.create({
        retour,
        article: { id: it.articleId } as any,
        quantite: it.quantite,
        reason: it.reason,
      }),
    );
    await retourArticleItemRepository.save(items);

    return res.json({ message: "retour ajouté" });
  }

  /* ---------------------------------------------------- */
  /* 2. LIST                                               */
  /* ---------------------------------------------------- */
  public async listRetours(req: Request, res: Response) {
    const q = req.query as any as ListRetoursDto;
    const page = Number(q.page) || 1;
    const max = Number(process.env.MAX_PER_PAGE) || 20;

    /* ---------- base conditions ---------- */
    const where: any = {};

    // Filter by Chantier
    if (q.chantierId) where.chantier = { code: q.chantierId };

    // Filter by Article
    if (q.articleId) {
      where.items = { article: { id: q.articleId } };
    }

    // Filter by ID - ignore if id = 0
    if (q.id != undefined) {
      where.id = q.id;
    }

    // Filter by Status (pending | confirmed | denied)
    if (q.status) {
      where.status = q.status;
    }

    if (q.date) {
      where.date = q.date;
    }

    const [retours, total] = await retourRepository.findAndCount({
      where,
      relations: {
        chantier: true,
        items: { article: true },
        documents: true,
      },
      order: { id: "DESC" },
      skip: (page - 1) * max,
      take: max,
    });

    res.json({
      retours,
      count: total,
      totalPages: Math.ceil(total / max),
      currentPage: page,
      lastPage: page >= Math.ceil(total / max),
    });
  }

  /* ---------------------------------------------------- */
  /* 3. APPROVE / DENY                                     */
  /* ---------------------------------------------------- */
  public async approveDenyRetour(req: Request, res: Response) {
    const dto = req.body as ApproveDenyRetourDto;

    // Load retour with items and articles
    const retour = await retourRepository.findOne({
      where: { id: dto.retourId },
      relations: { items: { article: true } },
    });
    if (!retour) return res.status(404).json({ message: "Retour introuvable" });

    if (dto.action === "approve") {
      // Update stock for each returned article (increment stock)
      for (const item of retour.items) {
        const article = await articlesRepositoy.findOneBy({
          id: item.article.id,
        });
        if (article) {
          article.stockActuel += item.quantite;
          await articlesRepositoy.save(article);
          console.log(
            `📦 Stock updated: ${article.nom} +${item.quantite} → ${article.stockActuel}`,
          );
        }
      }

      retour.status = "confirmed";
      await retourRepository.save(retour);

      // Génération du Bon de Retour (BR) pour le retour approuvé
      const retourWithRelations = await retourRepository.findOne({
        where: { id: retour.id },
        relations: {
          chantier: { compte: true },
          items: { article: { unite: true } },
        },
      });

      let documents: { id: number; type: string; downloadUrl: string }[] = [];

      if (retourWithRelations) {
        const brInfo = await generateBonDeRetourForRetour(retourWithRelations);
        const baseUrl = process.env.API_BASE_URL || "";

        const doc = documentRepository.create({
          type: brInfo.type as any,
          filename: brInfo.filename,
          originalName: brInfo.filename,
          path: brInfo.path,
          mimeType: "application/pdf",
          size: brInfo.size,
          entree: null,
          demandeArticle: null,
          sortie: null,
          retour: retour,
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

      return res.json({
        message: "Retour approuvé, stock mis à jour, Bon de Retour généré",
        documents,
      });
    }

    // deny → delete
    await retourRepository.remove(retour);
    return res.json({ message: "Retour refusé et supprimé" });
  }
}
