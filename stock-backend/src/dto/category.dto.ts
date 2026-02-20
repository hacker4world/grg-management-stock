export interface AjouterCategoryDto {
  nom: string;
  sous_famille: string;
}

export interface ModifierCategoryDto {
  category_id: number;
  nom: string;
  sous_famille: string;
}

export interface SupprimerCategorieDto {
  category_id: number;
}
