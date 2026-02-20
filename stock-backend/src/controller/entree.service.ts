import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { ConfirmerEntreeDto } from "../dto/entree.dto";
import {
  entreeRepository,
  articlesRepositoy,
  fournisseurRepository,
  fabriquantRepository,
  documentRepository,
  compteRepository,
  entreeArticleItemRepository,
} from "../repository/repositories";
import { Raw } from "typeorm";
import { getUploadsDir, UPLOADS_ROOT } from "../config/multer.config";
import { Document, DocumentType } from "../entity/Document";
import { Role } from "../enums/role.enum";

export class EntreeService {
  /* ----------------------------------  AJOUTER (avec upload documents) ---------------------------------- */
  public async ajouterEntree(req: Request, res: Response) {
    // Auth and role are enforced by middleware
    const b = req.body as Record<string, string>;
    const items: any[] =
      typeof b.items === "string" ? JSON.parse(b.items) : b.items;
    const fournisseurId = Number(b.fournisseurId);
    const fabriquantId = Number(b.fabriquantId);
    const observation = b.observation || null;
    const compteId = Number(b.compteId);

    // Verify Compte and Role
    const compte = await compteRepository.findOneBy({ id: compteId });
    if (!compte) return res.status(404).json({ message: "Compte introuvable" });

    if (!fournisseurId || !fabriquantId)
      return res
        .status(400)
        .json({ message: "Champs obligatoires manquants ou invalides" });

    // 3. Fichiers obligatoires : bande_commande et bande_livraison
    const files = req.files as {
      bande_commande?: Express.Multer.File[];
      bande_livraison?: Express.Multer.File[];
    };

    /* const bandeCommande = files?.bande_commande?.[0];
    const bandeLivraison = files?.bande_livraison?.[0]; */

    /* if (!bandeCommande || !bandeLivraison)
      return res.status(400).json({
        message:
          "Les deux documents sont obligatoires : bande_commande et bande_livraison",
      });
 */
    // 4. Vérifier l'article

    // 5. Vérifier le fournisseur
    const fournisseur = await fournisseurRepository.findOneBy({
      code: fournisseurId,
    });
    if (!fournisseur)
      return res.status(404).json({ message: "Fournisseur introuvable" });

    // 6. Vérifier le fabriquant
    const fabriquant = await fabriquantRepository.findOneBy({
      code: fabriquantId,
    });
    if (!fabriquant)
      return res.status(404).json({ message: "Fabriquant introuvable" });

    // 7. Créer l'entrée
    const nouvelle = entreeRepository.create({
      date: new Date().toISOString().slice(0, 10),
      observation,
      fournisseur,
      fabriquant,
      compte,
      status: "pending",
    });
    await entreeRepository.save(nouvelle);

    for (const item of items) {
      const article = await articlesRepositoy.findOneBy({ id: item.articleId });
      if (article) {
        const articleItem = entreeArticleItemRepository.create({
          entree: nouvelle,
          article: article,
          stockEntree: Number(item.stockEntree),
          prix: Number(item.prix),
        });
        await entreeArticleItemRepository.save(articleItem);
      }
    }

    // 8. Dossier uploads/entrees/{entreeId}
    const dir = getUploadsDir("entrees", nouvelle.id);
    if (!fs.existsSync(path.join(UPLOADS_ROOT, "entrees"))) {
      fs.mkdirSync(path.join(UPLOADS_ROOT, "entrees"), { recursive: true });
    }
    fs.mkdirSync(dir, { recursive: true });

    const saveFileAndCreateDoc = (
      file: Express.Multer.File,
      type: DocumentType,
    ): Document => {
      const ext = path.extname(file.originalname) || ".pdf";
      const filename = `${type}_${Date.now()}${ext}`;
      const filePath = path.join(dir, filename);
      fs.writeFileSync(filePath, file.buffer);
      const doc = documentRepository.create({
        type,
        filename,
        originalName: file.originalname,
        path: filePath,
        mimeType: file.mimetype,
        size: file.size,
        entree: nouvelle,
      });
      return doc;
    };

    /* const docBandeCommande = saveFileAndCreateDoc(
      bandeCommande,
      "bande_commande",
    );
    const docBandeLivraison = saveFileAndCreateDoc(
      bandeLivraison,
      "bande_livraison",
    );
    await documentRepository.save([docBandeCommande, docBandeLivraison]);

    const documents = await documentRepository.find({
      where: { entree: { id: nouvelle.id } },
    }); */

    return res.status(201).json({
      message: "Entrée créée",
      entree: nouvelle,
      /* documents, */
    });
  }

  public async listerEntrees(req: Request, res: Response) {
    const q = req.query as Record<string, string>;

    console.log(q);
    
    const page = Number(q.page) || 1;
    const max = Number(process.env.MAX_PER_PAGE) || 20;

    const where: any = {
      status: "confirmed",
    };

    // Build the where clause for non-article filters
    if (q.date) where.date = q.date;
    if (q.fournisseurId) where.fournisseur = { code: Number(q.fournisseurId) };
    if (q.fabriquantId) where.fabriquant = { code: Number(q.fabriquantId) };
    if (q.compteId) where.compte = { id: Number(q.compteId) };
    if (q.code) where.id = Number(q.code);

    // Handle article filter separately using Raw query
    if (q.articleId) {
      where.entreeArticleItems = {
        article: { id: Number(q.articleId) },
      };
    }

    if (q.stock_entree) {
      where.entreeArticleItems = {
        ...where.entreeArticleItems,
        stockEntree: Number(q.stock_entree),
      };
    }

    const [entrees, total] = await entreeRepository.findAndCount({
      where,
      relations: {
        fournisseur: true,
        fabriquant: true,
        documents: true,
        compte: true,
        entreeArticleItems: { article: true },
      },
      skip: (page - 1) * max,
      take: max,
      order: { date: "DESC" },
    });

    return res.json({
      entrees,
      count: entrees.length,
      totalPages: Math.ceil(total / max),
      lastPage: page >= Math.ceil(total / max),
    });
  }

  public async listerPendingEntrees(req: Request, res: Response) {
    const q = req.query as Record<string, string>;
    const page = Number(q.page) || 1;
    const max = Number(process.env.MAX_PER_PAGE) || 20;

    const where: any = {
      status: "pending",
    };

    if (q.compteId) where.compte = { id: Number(q.compteId) };
    if (q.date) where.date = q.date;
    if (q.fournisseurId) where.fournisseur = { code: Number(q.fournisseurId) };
    if (q.fabriquantId) where.fabriquant = { code: Number(q.fabriquantId) };
    if (q.code) where.id = Number(q.code);

    // Handle article filter through EntreeArticleItem
    if (q.articleId) {
      where.entreeArticleItems = {
        article: { id: Number(q.articleId) },
      };
    }

    // Note: prix and stockEntree filters should also be applied to entreeArticleItems
    if (q.prix || q.stockEntree) {
      where.entreeArticleItems = {
        ...where.entreeArticleItems,
        ...(q.prix && { prix: Number(q.prix) }),
        ...(q.stockEntree && { stockEntree: Number(q.stockEntree) }),
      };
    }

    const [entrees, total] = await entreeRepository.findAndCount({
      where,
      relations: {
        fournisseur: true,
        fabriquant: true,
        documents: true,
        compte: true,
        entreeArticleItems: { article: true },
      },
      skip: (page - 1) * max,
      take: max,
      order: { date: "DESC" },
    });

    return res.json({
      entrees,
      count: entrees.length,
      totalPages: Math.ceil(total / max),
      lastPage: page >= Math.ceil(total / max),
    });
  }

  public async confirmerOuRefuser(req: Request, res: Response) {
    const { entreeId, action } = req.body as ConfirmerEntreeDto;

    const entree = await entreeRepository.findOne({
      where: { id: entreeId },
      relations: {
        entreeArticleItems: {
          article: true,
        },
      },
    });
    if (!entree) return res.status(404).json({ message: "Entrée introuvable" });

    if (entree.status !== "pending")
      return res.status(400).json({ message: "L'entrée a déjà été traitée" });

    if (action === "deny") {
      await entreeRepository.remove(entree);
      return res.json({ message: "Entrée refusée et supprimée" });
    }

    entree.status = "confirmed";
    await entreeRepository.save(entree);

    for (const item of entree.entreeArticleItems) {
      item.article.stockActuel += item.stockEntree;
      await articlesRepositoy.save(item.article);
      await this.updateArticlePrixMoyenne(item.article.id);
    }

    return res.json({ message: "Entrée confirmée" });
  }

  public async supprimer(request: Request, response: Response) {
    const { code } = request.query;

    const entree = await entreeRepository.findOne({
      where: { id: Number(code) },
    });

    if (!entree)
      return response.status(404).json({
        message: "Entree n'est pas trouvé",
      });

    await entreeRepository.delete(entree);

    return response.json({
      message: "Entrée est supprimé",
    });
  }

  private async updateArticlePrixMoyenne(articleId: number) {
    // 1. Fetch all confirmed items for this specific article
    // We join the 'entree' to check the status and 'fournisseur' for the distinct logic
    const confirmedItems = await entreeArticleItemRepository.find({
      where: {
        article: { id: articleId },
        entree: { status: "confirmed" },
      },
      relations: {
        entree: { fournisseur: true },
      },
    });

    if (confirmedItems.length === 0) return;

    // 2. Filter to keep only those with distinct fournisseurs
    // As per your existing logic: we keep the latest entry for each unique fournisseur
    const distinctFournisseurMap = new Map<number, any>();
    confirmedItems.forEach((item) => {
      if (item.entree && item.entree.fournisseur) {
        // This overwrites previous entries, keeping the latest one found in the array
        distinctFournisseurMap.set(item.entree.fournisseur.code, item);
      }
    });

    const distinctItems = Array.from(distinctFournisseurMap.values());

    // 3. Calculate the sum of (stockEntree * prix)
    // 4. Calculate the sum of stockEntree
    let totalValuation = 0;
    let totalQuantity = 0;

    distinctItems.forEach((item) => {
      totalValuation += Number(item.stockEntree) * Number(item.prix);
      totalQuantity += Number(item.stockEntree);
    });

    // 5. Update the article with the new prix moyenne
    if (totalQuantity > 0) {
      const newPrixMoyenne = totalValuation / totalQuantity;

      await articlesRepositoy.update(articleId, {
        prixMoyenne: parseFloat(newPrixMoyenne.toFixed(2)), // Rounding to 2 decimals
      });
    }
  }
}
