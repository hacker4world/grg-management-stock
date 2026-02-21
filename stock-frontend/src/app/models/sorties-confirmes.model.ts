export interface SortieConfirmeModel {
  id: number;
  date: string;
  typeSortie: 'interne_depot' | 'interne_chantier' | 'externe';
  status: 'pending' | 'confirmed';
  observation: string | null;
  documents: any[];

  // Chantier (for interne_chantier)
  chantier?: {
    code: number;
    nom: string;
  } | null;

  // Depot (for interne_depot)
  depot?: {
    id: number;
    nom: string;
  } | null;

  // Account/User
  compte: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };

  // Articles
  articleSorties: any[];

  // Transporter fields for interne_depot
  nomTransporteurDepot?: string | null;
  matriculeTransporteurDepot?: string | null;

  // Transporter fields for interne_chantier
  nomTransporteurChantier?: string | null;
  matriculeTransporteurChantier?: string | null;

  // External sortie fields
  nomEntreprise?: string | null;
  adresseEntreprise?: string | null;
  matriculeFiscalEntreprise?: string | null;
  nomClient?: string | null;
  sousTypeSortieExterne?: 'avec_transporteur' | 'sans_transporteur' | null;
  nomTransporteurExterne?: string | null;
  matriculeTransporteurExterne?: string | null;
}

export interface SortieConfirmeListResponse {
  sorties: SortieConfirmeModel[];
  count: number;
  totalPages: number;
  currentPage: number;
  lastPage: boolean;
}
