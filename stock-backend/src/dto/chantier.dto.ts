export interface AjouterChantierDto {
  nom: string;
  adresse: string;
  compteId: number;
}

export interface ModifierChantierDto {
  code_chantier: number; // ← was string
  nom: string;
  adresse: string;
  compteId?: number;
}

export interface SupprimerChantierDto {
  code_chantier: number; // ← was string
}

export interface AffecterChantierDto {
  code_chantier: number;
  compte_id: number;
}
