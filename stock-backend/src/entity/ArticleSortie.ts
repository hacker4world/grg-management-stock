import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Article } from "./Article";
import { Sortie } from "./Sortie";

@Entity()
export class ArticleSortie {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Sortie, (s) => s.articleSorties, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sortieId" })
  sortie: Sortie;

  @ManyToOne(() => Article, { onDelete: "CASCADE" })
  @JoinColumn({ name: "articleId" })
  article: Article;

  @Column("decimal", { precision: 10, scale: 2 })
  stockSortie: number;
}
