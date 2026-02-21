export interface RetourListResponseModel {
  retours: Retour[];
  count: number;
  totalPages: number;
  lastPage: boolean;
}

export interface Retour {
  id: number;
  date: string; // ISO date
  status: 'pending' | 'confirmed' | 'denied';
  observation?: string;
  chantier: {
    code: number;
    nom: string;
    adresse: string;
  };
  items: RetourItem[];
  documents?: Document[];
}

export interface Document {
  id: number;
  name: string;
  url?: string;
  // Add other properties as needed
}

export interface RetourItem {
  id: number;
  quantite: number;
  observation?: string;
  reason: string;
  article: {
    id: number;
    nom: string;
    stockMinimum: number;
    stockActuel: number;
    prixMoyenne: number;
  };
}

export interface TraiterRetourRequest {
  retourId: number;
  action: 'approve' | 'deny';
}
