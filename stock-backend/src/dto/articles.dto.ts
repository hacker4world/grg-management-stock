export class CreateArticleDto {
  nom!: string;
  stockMin!: number;
  depotId!: number;
  categorieId!: number;
  uniteId!: number;
}

export class UpdateArticleDto {
  id!: number;
  nom!: string;
  stockMin!: number;
  depotId!: number;
  categorieId!: number;
  uniteId!: number;
}

export class DeleteArticleDto {
  id!: number;
}