import { SousFamilleModel } from './sous-familles.model';

export interface CategoriesListResposne {
  categories: Category[];
  lastPage: boolean;
}

export interface Category {
  id: number;
  nom: string;
  sous_famille: SousFamilleModel;
}

export interface CreerCategorieModel {
  nom: string;
  sous_famille: string;
}

export interface CreerCategorieResponse {
  categorie: Category;
}

export interface ModifierCategorieModel {
  category_id: number;
  nom: string;
  sous_famille: string;
}
