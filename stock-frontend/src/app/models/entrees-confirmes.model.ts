export interface EntreeConfirmeeModel {
  id: string;
  date: string;
  fournisseur: { nom: string };
  compte: { nom: string; prenom: string };
  entreeArticleItems: EntreeArticleItem[];
}

export interface EntreeArticleItem {
  id: string;
  stockEntree: number;
  prix: number;
  article: { nom: string };
}

export interface EntreeConfirmeeListResponse {
  entrees: EntreeConfirmeeModel[];
  lastPage: boolean;
}

export interface EntreeEnAttenteModel {
  id: string;
  stockEntree: number;
  date: string;
  prix: number;
  fournisseur: { nom: string };
  article: { nom: string };
  documents: any;
  compte: any;
  entreeArticleItems: any[];
}

export interface EntreeEnAttenteListResponse {
  entrees: EntreeEnAttenteModel[];
  lastPage: boolean;
}
