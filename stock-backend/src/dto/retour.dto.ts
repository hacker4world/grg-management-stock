export interface CreateRetourDto {
  chantierId: number;
  observation?: string;
  items: {
    articleId: number;
    quantite: number;
    reason: string;
  }[];
}

export interface ListRetoursDto {
  chantierId?: number;
  articleId?: number;
  id?: number; // ← ADD THIS
  page?: number;
  status?: string;
  date?: any;
}


export interface ApproveDenyRetourDto {
  retourId: number;
  action: "approve" | "deny";
}
