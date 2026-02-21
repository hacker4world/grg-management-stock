export interface DemandeArticleModel {
  id: number;
  date: string;
  observation?: string;
  status: string;
  chantier: {
    code: number;
    nom: string;
    adresse: string;
  };
  items: {
    id: number;
    quantite: number;
    article: {
      id: number;
      nom: string;
      stockMinimum: number;
      stockActuel: number;
      prixMoyenne: number;
    };
  }[];
  documents?: Document[];
}

export interface Document {
  id: number;
  name: string;
  url?: string;
  // Add other properties as needed
}

export interface DemandeArticleListResponse {
  demandes: DemandeArticleModel[];
  count: number;
  totalPages: number;
  lastPage: boolean;
}
