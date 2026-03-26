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
    try {
      const data = req.body as CreateArticleDto;

      // Validate required fields (adjust according to your DTO)
      if (!data.nom || !data.depotId || !data.uniteId || !data.categorieId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

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
        stockMinimum: data.stockMin ?? 0,
        stockActuel: 0,
        prixMoyenne: 0,
        depot,
        unite,
        categorie,
      });

      await articlesRepositoy.save(newArticle);
      return res.json({ message: "Article créé", article: newArticle });
    } catch (error) {
      console.error("Error in createArticle:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  public async listArticles(req: Request, res: Response) {
    try {
      const q = req.query;
      const max = Number(process.env.MAX_PER_PAGE) || 20;

      const where: any = {};

      // Nom search (case-insensitive)
      if (q.query) {
        const searchTerm = String(q.query).trim();
        if (searchTerm) {
          where.nom = Raw((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
            nom: `%${searchTerm}%`,
          });
        }
      }

      // Depot filter
      if (q.depotId) {
        const depotId = Number(q.depotId);
        if (!isNaN(depotId)) {
          where.depot = { id: depotId };
        }
      }

      // Categorie filter
      if (q.categorieId) {
        const catId = Number(q.categorieId);
        if (!isNaN(catId)) {
          where.categorie = { id: catId };
        }
      }

      // Unite filter
      if (q.uniteId) {
        const uniteId = Number(q.uniteId);
        if (!isNaN(uniteId)) {
          where.unite = { id: uniteId };
        }
      }

      // Prix moyenne exact
      if (q.prixMoyenne) {
        const prix = Number(q.prixMoyenne);
        if (!isNaN(prix)) {
          where.prixMoyenne = prix;
        }
      }

      // Stock minimum exact
      if (q.stockMinimum) {
        const min = Number(q.stockMinimum);
        if (!isNaN(min)) {
          where.stockMinimum = min;
        }
      }

      // Stock actuel exact
      if (q.stockActuel) {
        const act = Number(q.stockActuel);
        if (!isNaN(act)) {
          where.stockActuel = act;
        }
      }

      // Pagination
      let page = q.page ? Number(q.page) : 1;
      if (isNaN(page) || page < 1) page = 1;

      // If page is 0 or missing, return all (unpaginated)
      if (!q.page || q.page === "0") {
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
          order: { id: "DESC" },
        });
        return res.json({ articles });
      }

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

      return res.json({
        articles,
        count: articles.length,
        totalPages: Math.ceil(total / max),
        currentPage: page,
        lastPage: page >= Math.ceil(total / max),
      });
    } catch (error) {
      console.error("Error in listArticles:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  public async listArticleFournisseurs(req: Request, res: Response) {
    try {
      const { articleId } = req.query;

      if (!articleId) {
        return res
          .status(400)
          .json({ message: "L'ID de l'article est requis" });
      }

      const articleIdNum = Number(articleId);
      if (isNaN(articleIdNum)) {
        return res.status(400).json({ message: "ID d'article invalide" });
      }

      const article = await articlesRepositoy.findOne({
        where: { id: articleIdNum },
      });

      if (!article) {
        return res.status(404).json({ message: "Article introuvable" });
      }

      const items = await entreeArticleItemRepository.find({
        where: { article: { id: article.id } },
        relations: ["entree", "entree.fournisseur"],
      });

      const fournisseurMap = new Map<
        number,
        { fournisseur: Fournisseur; stockTotal: number }
      >();

      items.forEach((item) => {
        const fournisseur = item.entree?.fournisseur;
        if (!fournisseur) return;

        const code = fournisseur.code;
        const existing = fournisseurMap.get(code);

        if (existing) {
          existing.stockTotal += Number(item.stockEntree);
        } else {
          fournisseurMap.set(code, {
            fournisseur,
            stockTotal: Number(item.stockEntree),
          });
        }
      });

      const fournisseurs = Array.from(fournisseurMap.values()).map((entry) => ({
        ...entry.fournisseur,
        stockTotal: entry.stockTotal,
      }));

      return res.json({
        message: "Liste des fournisseurs",
        fournisseurs,
      });
    } catch (error) {
      console.error("Error in listArticleFournisseurs:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  public async updateArticle(req: Request, res: Response) {
    try {
      const data = req.body as UpdateArticleDto;
      if (!data.id) {
        return res.status(400).json({ message: "ID de l'article requis" });
      }

      let article: Article | null;
      try {
        article = await fetchArticle(data.id);
      } catch (err) {
        console.error("fetchArticle error:", err);
        return res
          .status(500)
          .json({ message: "Erreur lors de la récupération de l'article" });
      }

      if (!article) {
        return res.status(404).json({ message: "Article introuvable" });
      }

      // Update depot if provided (explicitly allow null)
      if (data.depotId !== undefined) {
        if (data.depotId === null) {
          article.depot = null;
        } else {
          const depotIdNum = Number(data.depotId);
          if (isNaN(depotIdNum)) {
            return res.status(400).json({ message: "ID de dépôt invalide" });
          }
          const depot = await depotRepository.findOneBy({ id: depotIdNum });
          if (!depot) {
            return res.status(404).json({ message: "Dépôt introuvable" });
          }
          article.depot = depot;
        }
      }

      // Update unite (allow null)
      if (data.uniteId !== undefined) {
        if (data.uniteId === null) {
          article.unite = null;
        } else {
          const uniteIdNum = Number(data.uniteId);
          if (isNaN(uniteIdNum)) {
            return res.status(400).json({ message: "ID d'unité invalide" });
          }
          const unite = await uniteRepository.findOneBy({ id: uniteIdNum });
          if (!unite) {
            return res.status(404).json({ message: "Unité introuvable" });
          }
          article.unite = unite;
        }
      }

      // Update categorie (allow null)
      if (data.categorieId !== undefined) {
        if (data.categorieId === null) {
          article.categorie = null;
        } else {
          const catIdNum = Number(data.categorieId);
          if (isNaN(catIdNum)) {
            return res
              .status(400)
              .json({ message: "ID de catégorie invalide" });
          }
          const categorie = await categoryRepository.findOne({
            where: { id: catIdNum },
            relations: { sous_famille: { famille: true } },
          });
          if (!categorie) {
            return res.status(404).json({ message: "Catégorie introuvable" });
          }
          article.categorie = categorie;
        }
      }

      // Update scalar fields if provided
      if (data.nom !== undefined) article.nom = data.nom;
      if (data.stockMin !== undefined) article.stockMinimum = data.stockMin;

      await articlesRepositoy.save(article);
      return res.json({ message: "Article modifié", article });
    } catch (error) {
      console.error("Error in updateArticle:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  public async deleteArticle(req: Request, res: Response) {
    try {
      const { id } = req.query as any as DeleteArticleDto;

      if (!id) {
        return res
          .status(422)
          .json({ message: "ID de l'article est obligatoire" });
      }

      const idNum = Number(id);
      if (isNaN(idNum)) {
        return res.status(400).json({ message: "ID d'article invalide" });
      }

      const exists = await articlesRepositoy.exist({ where: { id: idNum } });
      if (!exists) {
        return res.status(404).json({ message: "Article introuvable" });
      }

      await articlesRepositoy.delete(idNum);
      return res.json({ message: "Article supprimé" });
    } catch (error) {
      console.error("Error in deleteArticle:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
