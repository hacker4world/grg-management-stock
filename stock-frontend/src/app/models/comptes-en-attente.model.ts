export interface CompteEnAttenteModel {
  id: string;
  nom: string;
  prenom: string;
  nom_utilisateur: string;
  role: string;
}

export interface CompteEnAttenteListResponse {
  comptes: CompteEnAttenteModel[];
  lastPage: boolean;
}
