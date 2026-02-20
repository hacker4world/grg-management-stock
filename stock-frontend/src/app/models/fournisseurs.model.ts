export interface FournisseurListResponseModel {
  fournisseurs: FournisseurModel[];
  lastPage: boolean;
}

export interface FournisseurModel {
  code: number;
  nom: string;
  contact: string;
  adresse: string;
  entrees?: any[];
}

export interface CreateFournisseurModel {
  nom?: string;
  contact?: string;
  adresse?: string;
}

export interface ModifierFournisseurModel {
  code_fournisseur: number;
  nom?: string;
  contact?: string;
  adresse?: string;
}
