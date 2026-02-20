import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Article } from "./Article";
import { Entree } from "./Entree";

@Entity()
export class Fabriquant {
  @PrimaryGeneratedColumn()
  code: number;

  @Column()
  nom: string;

  @Column()
  adresse: string;

  @Column()
  contact: string;

  @OneToMany(() => Entree, (entree) => entree.fabriquant)
  entrees: Entree[];
}
