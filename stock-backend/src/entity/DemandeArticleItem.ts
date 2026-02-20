import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Article } from "./Article";
import { DemandeArticle } from "./DemandeArticle";

@Entity()
export class DemandeArticleItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  quantite: number;

  @ManyToOne(() => DemandeArticle, (d) => d.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "demandeId" })
  demande: DemandeArticle;

  @ManyToOne(() => Article, { onDelete: "CASCADE" })
  @JoinColumn({ name: "articleId" })
  article: Article;
}
