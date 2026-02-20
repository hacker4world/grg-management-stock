export class CreateDemandeArticleDto {
  chantierId!: number;
  items!: Array<{ articleId: number; quantity: number }>;
  observation?: string;
}

export class ConfirmDenyDemandeDto {
  demandeId!: number;
  action!: "confirm" | "deny";
}

export class ListDemandeFilters {
  status?: string;
  chantierId?: number;
  articleId?: number;
  id?: number; // ← ADD THIS
  date?: string;
  page?: number;
}
