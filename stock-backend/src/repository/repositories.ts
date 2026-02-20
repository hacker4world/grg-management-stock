import { AppDataSource } from "../data-source";
import { Article } from "../entity/Article";
import { ArticleSortie } from "../entity/ArticleSortie";
import { Categorie } from "../entity/Categorie";
import { Chantier } from "../entity/Chantier";
import { Compte } from "../entity/Compte";
import { DemandeArticle } from "../entity/DemandeArticle";
import { Depot } from "../entity/Depot";
import { Entree } from "../entity/Entree";
import { Fabriquant } from "../entity/Fabriquant";
import { Famille } from "../entity/Famille";
import { Fournisseur } from "../entity/Fournisseur";
import { RetourArticle } from "../entity/RetourArticle";
import { RetourArticleItem } from "../entity/RetourArticleItem";
import { Sortie } from "../entity/Sortie";
import { SousFamille } from "../entity/SousFamille";
import { Unite } from "../entity/Unite";
import { Document } from "../entity/Document";
import { StockNotification } from "../entity/StockNotification";
import { EntreeArticleItem } from "../entity/EntreeArticleItem";

export const articlesRepositoy = AppDataSource.getRepository(Article);

export const categoryRepository = AppDataSource.getRepository(Categorie);

export const chantierRepository = AppDataSource.getRepository(Chantier);

export const compteRepository = AppDataSource.getRepository(Compte);

export const fabriquantRepository = AppDataSource.getRepository(Fabriquant);

export const familleRepository = AppDataSource.getRepository(Famille);

export const fournisseurRepository = AppDataSource.getRepository(Fournisseur);

export const sousFamillesRepository = AppDataSource.getRepository(SousFamille);

export const uniteRepository = AppDataSource.getRepository(Unite);

export const depotRepository = AppDataSource.getRepository(Depot);

export const demandeArticlesRepository =
  AppDataSource.getRepository(DemandeArticle);

export const retourRepository = AppDataSource.getRepository(RetourArticle);
export const retourArticleItemRepository =
  AppDataSource.getRepository(RetourArticleItem);
export const entreeRepository = AppDataSource.getRepository(Entree);
export const sortieRepository = AppDataSource.getRepository(Sortie);
export const articleSortieRepository =
  AppDataSource.getRepository(ArticleSortie);
export const documentRepository = AppDataSource.getRepository(Document);
export const stockNotificationRepository = AppDataSource.getRepository(StockNotification)

export const entreeArticleItemRepository = AppDataSource.getRepository(EntreeArticleItem)