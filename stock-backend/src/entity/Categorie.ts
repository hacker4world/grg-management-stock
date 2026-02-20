import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { SousFamille } from "./SousFamille";
import { Article } from "./Article";

@Entity()
export class Categorie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @ManyToOne(() => SousFamille, (sous_famille) => sous_famille.categories, {
    nullable: true,
    onDelete: "SET NULL",
  })
  sous_famille: SousFamille;

  @OneToMany(() => Article, (article) => article.categorie)
  articles: Article[];
}
