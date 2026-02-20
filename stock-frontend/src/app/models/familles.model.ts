import { SousFamilleModel } from './sous-familles.model';

export interface FamilleListResponseModel {
  familles: FamilleModel[];
  lastPage: boolean;
}

export interface FamilleModel {
  id: number;
  nom: string;
}

export interface CreateFamilleModel {
  nom: string;
}

export interface ModifierFamilleModel {
  famille_id: number;
  nom: string;
}
