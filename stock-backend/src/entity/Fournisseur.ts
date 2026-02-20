import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Entree } from "./Entree";

@Entity()
export class Fournisseur {
  @PrimaryGeneratedColumn()
  code: number;

  @Column()
  nom: string;

  @Column()
  contact: string;

  @Column()
  adresse: string;

  @OneToMany(() => Entree, (entree) => entree.fournisseur)
  entrees: Entree[];
}
