export interface CreerSousFamille {
  nom: string;
  famille_id: number;
}

export interface ModifierSousFamille {
  sous_famille_id: number;
  nom: string;
  famille_id: number;
}

export interface SupprimerSousFamille {
  sous_famille_id: number;
}
