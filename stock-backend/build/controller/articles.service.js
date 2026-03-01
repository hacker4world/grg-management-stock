"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleService = void 0;
require("dotenv/config");
const fetch_util_1 = require("../utilities/fetch.util");
const repositories_1 = require("../repository/repositories");
const typeorm_1 = require("typeorm");
class ArticleService {
    async createArticle(req, res) {
        const data = req.body;
        const depot = await repositories_1.depotRepository.findOneBy({ id: data.depotId });
        if (!depot)
            return res.status(404).json({ message: "Dépôt introuvable" });
        const unite = await repositories_1.uniteRepository.findOneBy({ id: data.uniteId });
        if (!unite)
            return res.status(404).json({ message: "Unité introuvable" });
        const categorie = await repositories_1.categoryRepository.findOne({
            where: { id: data.categorieId },
            relations: { sous_famille: { famille: true } },
        });
        if (!categorie)
            return res.status(404).json({ message: "Catégorie introuvable" });
        const newArticle = repositories_1.articlesRepositoy.create({
            nom: data.nom,
            stockMinimum: data.stockMin,
            stockActuel: 0,
            prixMoyenne: 0,
            depot,
            unite,
            categorie,
        });
        await repositories_1.articlesRepositoy.save(newArticle);
        res.json({ message: "Article créé", article: newArticle });
    }
    async listArticles(req, res) {
        const q = req.query;
        const max = Number(process.env.MAX_PER_PAGE) || 20;
        const where = {};
        if (q.query)
            where.nom = (0, typeorm_1.Raw)((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
                nom: `%${q.query}%`,
            });
        if (q.depotId)
            where.depot = { id: Number(q.depotId) };
        if (q.categorieId)
            where.categorie = { id: Number(q.categorieId) };
        if (q.prixMoyenne) {
            const prix = Number(q.prixMoyenne);
            if (!isNaN(prix))
                where.prixMoyenne = prix;
        }
        // stockMinimum (exact or range)
        if (q.stockMinimum) {
            const min = Number(q.stockMinimum);
            if (!isNaN(min))
                where.stockMinimum = min;
        }
        // stockActuel (exact or range)
        if (q.stockActuel) {
            const act = Number(q.stockActuel);
            if (!isNaN(act))
                where.stockActuel = act;
        }
        // uniteId
        if (q.uniteId)
            where.unite = { id: Number(q.uniteId) };
        let page = q.page;
        if (!page || page == "0") {
            const articles = await repositories_1.articlesRepositoy.find({
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
        const [articles, total] = await repositories_1.articlesRepositoy.findAndCount({
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
    async listArticleFournisseurs(request, resposne) {
        const { articleId } = request.query;
        if (!articleId) {
            return resposne
                .status(400)
                .json({ message: "L'ID de l'article est requis" });
        }
        const article = await repositories_1.articlesRepositoy.findOne({
            where: { id: Number(articleId) },
        });
        if (!article) {
            return resposne.status(404).json({
                message: "Article est introuvable",
            });
        }
        // 1. Find all items in entries that contain this article
        // We include the 'entree' and the 'entree.fournisseur' relations
        const items = await repositories_1.entreeArticleItemRepository.find({
            where: { article: { id: article.id } },
            relations: ["entree", "entree.fournisseur"],
        });
        const fournisseurMap = new Map();
        // 2. Iterate through the items to aggregate stock by fournisseur
        items.forEach((item) => {
            const fournisseur = item.entree?.fournisseur;
            if (!fournisseur)
                return; // Skip if no fournisseur is attached to the entry
            const code = fournisseur.code;
            const existing = fournisseurMap.get(code);
            if (existing) {
                existing.stockTotal += Number(item.stockEntree);
            }
            else {
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
    async updateArticle(req, res) {
        const data = req.body;
        const article = await (0, fetch_util_1.fetchArticle)(data.id);
        if (!article)
            return res.status(404).json({ message: "Article introuvable" });
        if (data.depotId !== article.depot?.id) {
            const depot = await repositories_1.depotRepository.findOneBy({ id: data.depotId });
            if (!depot)
                return res.status(404).json({ message: "Dépôt introuvable" });
            article.depot = depot;
        }
        if (data.uniteId !== article.unite?.id) {
            const unite = await repositories_1.uniteRepository.findOneBy({ id: data.uniteId });
            if (!unite)
                return res.status(404).json({ message: "Unité introuvable" });
            article.unite = unite;
        }
        if (data.categorieId !== article.categorie.id) {
            const categorie = await repositories_1.categoryRepository.findOne({
                where: { id: data.categorieId },
                relations: { sous_famille: { famille: true } },
            });
            if (!categorie)
                return res.status(404).json({ message: "Catégorie introuvable" });
            article.categorie = categorie;
        }
        article.nom = data.nom;
        article.stockMinimum = data.stockMin;
        await repositories_1.articlesRepositoy.save(article);
        res.json({ message: "Article modifié" });
    }
    async deleteArticle(req, res) {
        const { id } = req.query;
        if (!id)
            return res.status(422).json({
                message: "Article id est obligatoire",
            });
        const exists = await repositories_1.articlesRepositoy.exist({ where: { id } });
        if (!exists)
            return res.status(404).json({ message: "Article introuvable" });
        await repositories_1.articlesRepositoy.delete(id);
        res.json({ message: "Article supprimé" });
    }
}
exports.ArticleService = ArticleService;
//# sourceMappingURL=articles.service.js.map