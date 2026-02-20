import { FamilleModel } from './familles.model';

export interface SousFamilleModel {
  id: number;
  nom: string;
  famille?: FamilleModel;
}

export interface SousFamillesListModel {
  sousFamilles: SousFamilleModel[];
  lastPage: boolean;
}

export interface CreerSousFamilleModel {
  nom: string;
  famille_id?: number;
}

export interface CreerSousFamilleResponseModel {
  sous_famille: SousFamilleModel;
}
