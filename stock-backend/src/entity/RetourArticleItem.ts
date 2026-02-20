import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Article } from "./Article";
import { RetourArticle } from "./RetourArticle";

@Entity()
export class RetourArticleItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  quantite: number;

  @Column({ type: "varchar", length: 255 })
  reason: string;

  @ManyToOne(() => RetourArticle, (r) => r.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "retourId" })
  retour: RetourArticle;

  @ManyToOne(() => Article, { onDelete: "CASCADE" })
  @JoinColumn({ name: "articleId" })
  article: Article;
}
