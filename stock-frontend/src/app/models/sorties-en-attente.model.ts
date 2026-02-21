export interface SortieEnAttenteModel {
  id: number;
  date: string;
  typeSortie: 'interne_depot' | 'interne_chantier' | 'externe';
  status: 'pending' | 'confirmed';
  observation: string | null;

  // Relations
  chantier: { code: number; nom: string } | null;
  depot: { id: number; nom: string } | null;
  compte: {
    id: number;
    email: string;
    role: string;
    nom?: string;
    prenom?: string;
  };
  articleSorties: Array<{
    id: number;
    stockSortie: number;
    article: {
      id: number;
      nom: string;
      stockActuel: number;
    };
  }>;

  // Transporter fields for interne_depot
  nomTransporteurDepot: string | null;
  matriculeTransporteurDepot: string | null;

  // Transporter fields for interne_chantier
  nomTransporteurChantier: string | null;
  matriculeTransporteurChantier: string | null;

  // External sortie fields
  nomEntreprise: string | null;
  adresseEntreprise: string | null;
  matriculeFiscalEntreprise: string | null;
  nomClient: string | null;
  sousTypeSortieExterne: 'avec_transporteur' | 'sans_transporteur' | null;

  // External transporter (for externe avec_transporteur)
  nomTransporteurExterne: string | null;
  matriculeTransporteurExterne: string | null;
}

export interface SortieEnAttenteListResponse {
  sorties: SortieEnAttenteModel[];
  count: number;
  totalPages: number;
  currentPage: number;
  lastPage: boolean;
}
