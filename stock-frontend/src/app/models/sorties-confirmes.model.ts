export interface SortieConfirmeeModel {
  id: number;
  date: string;
  chantier: any;
  article: any;
  observation: string;
  articleSorties: any;
  compte: any;
  documents?: any;
}

export interface SortieConfirmeeListResponse {
  sorties: SortieConfirmeeModel[];
  lastPage: boolean;
}
