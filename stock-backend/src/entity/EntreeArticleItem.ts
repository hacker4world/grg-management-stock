import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Entree } from "./Entree";
import { Article } from "./Article";

// entity/EntreeArticleItem.ts
@Entity()
export class EntreeArticleItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Entree, (e) => e.entreeArticleItems, { onDelete: "CASCADE" })
  entree: Entree;

  @ManyToOne(() => Article, { onDelete: "CASCADE" })
  article: Article;

  @Column("int", { unsigned: true })
  stockEntree: number;

  @Column("decimal", { precision: 10, scale: 2 })
  prix: number;
}
