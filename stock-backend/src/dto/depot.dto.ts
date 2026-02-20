export interface AjouterDepotDto {
  nom: string;
  adresse?: string;
}

export interface ModifierDepotDto {
  id: number;
  nom: string;
  adresse?: string;
}
