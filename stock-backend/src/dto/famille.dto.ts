export interface CreerFamilleDto {
  nom: string;
}

export interface ModifierFamilleDto {
  famille_id: number;
  nom: string;
}

export interface SupprimerFamileDto {
  famille_id: number;
}

export interface AjouterFournisseurDto {
  nom: string;
  contact: string;
  adresse: string;
}

export interface ModifierFournisseur {
  code_fournisseur: number;
  nom: string;
  contact: string;
  adresse: string;
}

export interface SupprimerFournisseur {
  fournisseur_code: number;
}
