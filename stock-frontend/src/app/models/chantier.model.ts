export interface ChantierModel {
  code: string;
  nom: string;
  adresse: string;
  compte: any;
}

export interface ChantierListResponse {
  chantiers: ChantierModel[];
  lastPage: boolean;
}

export interface CreateChantierModel {
  nom: string;
  adresse: string;
  compteId: number;
}

export interface ModifierChantier {
  code_chantier: string;
  nom: string;
  adresse: string;
  compteId: number;
}
