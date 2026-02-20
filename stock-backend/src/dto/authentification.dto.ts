export interface LoginDto {
  nom_utilisateur: string;
  motdepasse: string;
}

export interface SignupDto {
  nom: string;
  prenom: string;
  nom_utilisateur: string;
  motdepasse: string;
}

export interface AccepterRefuserCompteValidator {
  compte_id: number;
  role: string;
}
