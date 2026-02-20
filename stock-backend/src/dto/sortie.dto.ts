// dto/sortie.dto.ts

// ============ SORTIE INTERNE DEPOT ============
export interface CreateSortieInterneDepotDto {
  articles: Array<{
    articleId: number;
    stockSortie: number;
  }>;
  observation?: string;
  compteId: number;
  typeSortie: "interne_depot";
  depotId: number; // Required for this type
  nomTransporteur: string;
  matriculeTransporteur: string;
}

// ============ SORTIE INTERNE CHANTIER ============
export interface CreateSortieInterneChantierDto {
  articles: Array<{
    articleId: number;
    stockSortie: number;
  }>;
  observation?: string;
  compteId: number;
  typeSortie: "interne_chantier";
  chantierId: number; // Required for this type
  nomTransporteur: string;
  matriculeTransporteur: string;
}

// ============ SORTIE EXTERNE - AVEC TRANSPORTEUR ============
export interface CreateSortieExterneAvecTransporteurDto {
  articles: Array<{
    articleId: number;
    stockSortie: number;
  }>;
  observation?: string;
  compteId: number;
  typeSortie: "externe";
  sousTypeSortieExterne: "avec_transporteur";
  nomEntreprise: string;
  adresseEntreprise: string;
  matriculeFiscalEntreprise: string;
  nomClient: string;
  nomTransporteur: string;
  matriculeTransporteur: string;
}

// ============ SORTIE EXTERNE - SANS TRANSPORTEUR ============
export interface CreateSortieExterneSansTransporteurDto {
  articles: Array<{
    articleId: number;
    stockSortie: number;
  }>;
  observation?: string;
  compteId: number;
  typeSortie: "externe";
  sousTypeSortieExterne: "sans_transporteur";
  nomEntreprise: string;
  adresseEntreprise: string;
  matriculeFiscalEntreprise: string;
  nomClient: string;
}

// Union type for all create DTOs
export type CreateSortieDto =
  | CreateSortieInterneDepotDto
  | CreateSortieInterneChantierDto
  | CreateSortieExterneAvecTransporteurDto
  | CreateSortieExterneSansTransporteurDto;

export interface ListSortiesFilterDto {
  page?: string;
  articleId?: string;
  chantierId?: string;
  depotId?: string;
  date?: string;
  stockSortie?: string;
  confirmed?: string;
  compteId?: string;
  typeSortie?: string; // Filter by sortie type
  id?: string;
}

export interface ConfirmDenySortieDto {
  sortieId: number;
  action: "confirm" | "deny";
}

export interface DeleteSortieDto {
  id: string;
}
