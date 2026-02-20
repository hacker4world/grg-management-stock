import "dotenv/config";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Article } from "./entity/Article";
import { Categorie } from "./entity/Categorie";
import { Chantier } from "./entity/Chantier";
import { Fabriquant } from "./entity/Fabriquant";
import { Famille } from "./entity/Famille";
import { Fournisseur } from "./entity/Fournisseur";
import { SousFamille } from "./entity/SousFamille";
import { Compte } from "./entity/Compte";
import { Depot } from "./entity/Depot";
import { Unite } from "./entity/Unite";
import { DemandeArticle } from "./entity/DemandeArticle";
import { DemandeArticleItem } from "./entity/DemandeArticleItem";
import { RetourArticle } from "./entity/RetourArticle";
import { RetourArticleItem } from "./entity/RetourArticleItem";
import { Entree } from "./entity/Entree";
import { Sortie } from "./entity/Sortie";
import { ArticleSortie } from "./entity/ArticleSortie";
import { Document } from "./entity/Document";
import { StockNotification } from "./entity/StockNotification";
import { EntreeArticleItem } from "./entity/EntreeArticleItem";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: "",
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [
    Article,
    Categorie,
    Chantier,
    Fabriquant,
    Famille,
    Fournisseur,
    SousFamille,
    Compte,
    Depot,
    Unite,
    DemandeArticle,
    DemandeArticleItem,
    RetourArticle,
    RetourArticleItem,
    Entree,
    EntreeArticleItem,
    Sortie,
    ArticleSortie,
    Document,
    StockNotification,
  ],
  migrations: [],
  subscribers: [],
});
