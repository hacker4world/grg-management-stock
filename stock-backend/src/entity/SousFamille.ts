import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Famille } from "./Famille";
import { Categorie } from "./Categorie";

@Entity()
export class SousFamille {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @ManyToOne(() => Famille, (famille) => famille.sous_familles, {
    nullable: true,
    onDelete: "SET NULL",
  })
  famille: Famille;

  @OneToMany(() => Categorie, (category) => category.sous_famille)
  categories: Categorie[];
}
