export interface EntreeArticleItemDto {
  articleId: number;
  stockEntree: number;
  prix: number;
}

export interface AjouterEntreeDto {
  articleId: number;
  observation?: string | null;
  prix: number;
  fournisseurId: number;
  fabriquantId: number;
  stockEntree: number;
  compteId: number; // Added field
  items: EntreeArticleItemDto[]; // New array of articles
}

export interface ConfirmerEntreeDto {
  entreeId: number;
  action: "confirm" | "deny";
}

export interface FilterEntreeDto {
  articleId?: string;
  date?: string;
  fournisseurId?: string;
  fabriquantId?: string;
  prix?: string;
  stockEntree?: string;
  confirmed?: string;
  compteId?: string; // Added for filtering
}
