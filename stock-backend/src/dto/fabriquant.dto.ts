export interface AjouterFabriquantDto {
  nom: string;
  adresse: string;
  contact: string;
}

export interface ModifierFabriquantDto {
  code_fabriquant: number;
  nom: string;
  adresse: string;
  contact: string;
}

export interface SupprimerFabriquantDto {
  code_fabriquant: number;
}
