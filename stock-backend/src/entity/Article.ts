import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Categorie } from "./Categorie";
import { Depot } from "./Depot";
import { Unite } from "./Unite";
import { Entree } from "./Entree";

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  stockMinimum: number;

  @Column()
  stockActuel: number;

  @Column()
  prixMoyenne: number;

  @ManyToOne(() => Depot, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "depotId" })
  depot: Depot;

  @ManyToOne(() => Unite, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "uniteId" })
  unite: Unite;

  @ManyToOne(() => Categorie, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "categorieId" })
  categorie: Categorie;
}
