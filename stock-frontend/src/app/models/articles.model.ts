export interface ArticleListResponseModel {
  articles: Article[];
  count: number;
  totalPages: number;
  lastPage: boolean;
}

export interface Article {
  id: number;
  nom: string;
  stockMinimum: number;
  stockActuel: number;
  prixMoyenne: number;
  depot: {
    id: number;
    nom: string;
  };
  unite: {
    id: number;
    nom: string;
  };
  categorie: {
    id: number;
    nom: string;
    sous_famille?: {
      id: number;
      nom: string;
      famille?: {
        id: number;
        nom: string;
      };
    };
  };
}
