"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("dotenv/config");
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const Article_1 = require("./entity/Article");
const Categorie_1 = require("./entity/Categorie");
const Chantier_1 = require("./entity/Chantier");
const Fabriquant_1 = require("./entity/Fabriquant");
const Famille_1 = require("./entity/Famille");
const Fournisseur_1 = require("./entity/Fournisseur");
const SousFamille_1 = require("./entity/SousFamille");
const Compte_1 = require("./entity/Compte");
const Depot_1 = require("./entity/Depot");
const Unite_1 = require("./entity/Unite");
const DemandeArticle_1 = require("./entity/DemandeArticle");
const DemandeArticleItem_1 = require("./entity/DemandeArticleItem");
const RetourArticle_1 = require("./entity/RetourArticle");
const RetourArticleItem_1 = require("./entity/RetourArticleItem");
const Entree_1 = require("./entity/Entree");
const Sortie_1 = require("./entity/Sortie");
const ArticleSortie_1 = require("./entity/ArticleSortie");
const Document_1 = require("./entity/Document");
const StockNotification_1 = require("./entity/StockNotification");
const EntreeArticleItem_1 = require("./entity/EntreeArticleItem");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [
        Article_1.Article,
        Categorie_1.Categorie,
        Chantier_1.Chantier,
        Fabriquant_1.Fabriquant,
        Famille_1.Famille,
        Fournisseur_1.Fournisseur,
        SousFamille_1.SousFamille,
        Compte_1.Compte,
        Depot_1.Depot,
        Unite_1.Unite,
        DemandeArticle_1.DemandeArticle,
        DemandeArticleItem_1.DemandeArticleItem,
        RetourArticle_1.RetourArticle,
        RetourArticleItem_1.RetourArticleItem,
        Entree_1.Entree,
        EntreeArticleItem_1.EntreeArticleItem,
        Sortie_1.Sortie,
        ArticleSortie_1.ArticleSortie,
        Document_1.Document,
        StockNotification_1.StockNotification,
    ],
    migrations: [],
    subscribers: [],
});
//# sourceMappingURL=data-source.js.map