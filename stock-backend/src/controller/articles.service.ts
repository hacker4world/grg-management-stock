import { Request, Response } from "express";
import "dotenv/config";
import {
  CreateArticleDto,
  UpdateArticleDto,
  DeleteArticleDto,
} from "../dto/articles.dto";
import { fetchArticle } from "../utilities/fetch.util";
import { Article } from "../entity/Article";
import {
  articlesRepositoy,
  categoryRepository,
  depotRepository,
  entreeArticleItemRepository,
  entreeRepository,
  uniteRepository,
} from "../repository/repositories";
import { Raw } from "typeorm";
import { Fournisseur } from "../entity/Fournisseur";

export class ArticleService {
  public async createArticle(req: Request, res: Response) {
    const data = req.body as CreateArticleDto;

    const depot = await depotRepository.findOneBy({ id: data.depotId });
    if (!depot) return res.status(404).json({ message: "Dépôt introuvable" });

    const unite = await uniteRepository.findOneBy({ id: data.uniteId });
    if (!unite) return res.status(404).json({ message: "Unité introuvable" });

    const categorie = await categoryRepository.findOne({
      where: { id: data.categorieId },
      relations: { sous_famille: { famille: true } },
    });
    if (!categorie)
      return res.status(404).json({ message: "Catégorie introuvable" });

    const newArticle = articlesRepositoy.create({
      nom: data.nom,
      stockMinimum: data.stockMin,
      stockActuel: 0,
      prixMoyenne: 0,
      depot,
      unite,
      categorie,
    });

    await articlesRepositoy.save(newArticle);
    res.json({ message: "Article créé", article: newArticle });
  }

  public async listArticles(req: Request, res: Response) {
    const q = req.query;

    const max = Number(process.env.MAX_PER_PAGE) || 20;

    const where: any = {};
    if (q.query)
      where.nom = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
        nom: `%${q.query}%`,
      });
    if (q.depotId) where.depot = { id: Number(q.depotId) };
    if (q.categorieId) where.categorie = { id: Number(q.categorieId) };

    if (q.prixMoyenne) {
      const prix = Number(q.prixMoyenne);
      if (!isNaN(prix)) where.prixMoyenne = prix;
    }

    // stockMinimum (exact or range)
    if (q.stockMinimum) {
      const min = Number(q.stockMinimum);
      if (!isNaN(min)) where.stockMinimum = min;
    }

    // stockActuel (exact or range)
    if (q.stockActuel) {
      const act = Number(q.stockActuel);
      if (!isNaN(act)) where.stockActuel = act;
    }

    // uniteId
    if (q.uniteId) where.unite = { id: Number(q.uniteId) };

    let page: any = q.page;

    if (!page || page == "0") {
      const articles = await articlesRepositoy.find({
        where,
        relations: {
          depot: true,
          unite: true,
          categorie: {
            sous_famille: {
              famille: true,
            },
          },
        },
      });
      return res.json({ articles });
    }

    page = Number(page);

    const [articles, total] = await articlesRepositoy.findAndCount({
      where,
      relations: {
        depot: true,
        unite: true,
        categorie: {
          sous_famille: {
            famille: true,
          },
        },
      },
      skip: (page - 1) * max,
      take: max,
      order: { id: "DESC" },
    });

    res.json({
      articles,
      count: articles.length,
      totalPages: Math.ceil(total / max),
      lastPage: page >= Math.ceil(total / max),
    });
  }

  public async listArticleFournisseurs(request: Request, resposne: Response) {
    const { articleId } = request.query;

    if (!articleId) {
      return resposne
        .status(400)
        .json({ message: "L'ID de l'article est requis" });
    }

    const article = await articlesRepositoy.findOne({
      where: { id: Number(articleId) },
    });

    if (!article) {
      return resposne.status(404).json({
        message: "Article est introuvable",
      });
    }

    // 1. Find all items in entries that contain this article
    // We include the 'entree' and the 'entree.fournisseur' relations
    const items = await entreeArticleItemRepository.find({
      where: { article: { id: article.id } },
      relations: ["entree", "entree.fournisseur"],
    });

    const fournisseurMap = new Map<
      number,
      { fournisseur: Fournisseur; stockTotal: number }
    >();

    // 2. Iterate through the items to aggregate stock by fournisseur
    items.forEach((item) => {
      const fournisseur = item.entree?.fournisseur;
      if (!fournisseur) return; // Skip if no fournisseur is attached to the entry

      const code = fournisseur.code;
      const existing = fournisseurMap.get(code);

      if (existing) {
        existing.stockTotal += Number(item.stockEntree);
      } else {
        fournisseurMap.set(code, {
          fournisseur: fournisseur,
          stockTotal: Number(item.stockEntree),
        });
      }
    });

    // 3. Format the response
    const fournisseurs = Array.from(fournisseurMap.values()).map((entry) => ({
      ...entry.fournisseur,
      stockTotal: entry.stockTotal,
    }));

    return resposne.json({
      message: "liste des fournisseurs",
      fournisseurs,
    });
  }

  public async updateArticle(req: Request, res: Response) {
    const data = req.body as UpdateArticleDto;
    const article = await fetchArticle(data.id);
    if (!article)
      return res.status(404).json({ message: "Article introuvable" });

    if (data.depotId !== article.depot?.id) {
      const depot = await depotRepository.findOneBy({ id: data.depotId });
      if (!depot) return res.status(404).json({ message: "Dépôt introuvable" });
      article.depot = depot;
    }
    if (data.uniteId !== article.unite?.id) {
      const unite = await uniteRepository.findOneBy({ id: data.uniteId });
      if (!unite) return res.status(404).json({ message: "Unité introuvable" });
      article.unite = unite;
    }
    if (data.categorieId !== article.categorie.id) {
      const categorie = await categoryRepository.findOne({
        where: { id: data.categorieId },
        relations: { sous_famille: { famille: true } },
      });
      if (!categorie)
        return res.status(404).json({ message: "Catégorie introuvable" });
      article.categorie = categorie;
    }

    article.nom = data.nom;
    article.stockMinimum = data.stockMin;

    await articlesRepositoy.save(article);
    res.json({ message: "Article modifié" });
  }

  public async deleteArticle(req: Request, res: Response) {
    const { id } = req.query as any as DeleteArticleDto;

    if (!id)
      return res.status(422).json({
        message: "Article id est obligatoire",
      });

    const exists = await articlesRepositoy.exist({ where: { id } });
    if (!exists)
      return res.status(404).json({ message: "Article introuvable" });

    await articlesRepositoy.delete(id);
    res.json({ message: "Article supprimé" });
  }
}
