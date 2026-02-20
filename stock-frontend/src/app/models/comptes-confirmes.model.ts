export interface CompteConfirmeModel {
  id: string;
  nom: string;
  prenom: string;
  nom_utilisateur: string;
  role: string;
}

export interface CompteConfirmeListResponse {
  comptes: CompteConfirmeModel[];
  lastPage: boolean;
}

export interface ModifierCompteConfirme {
  code_compte: string;
  nom: string;
  prenom: string;
  nomUtilisateur: string;
  role: string;
}
