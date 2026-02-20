export interface SortieEnAttenteModel {
  id: number;
  articles: Array<{ articleId: number; stockSortie: number }>;
  date: string;
  observation?: string;
  chantier?: {
    id: number;
    nom: string;
  };
  compte: {
    id: number;
    nom: string;
    prenom: string;
  };
}

export interface SortieEnAttenteListResponse {
  sorties: SortieEnAttenteModel[];
  lastPage: boolean;
}
