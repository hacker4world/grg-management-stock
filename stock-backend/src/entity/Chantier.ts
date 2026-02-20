// entity/Chantier.ts
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Compte } from "./Compte";
import { Sortie } from "./Sortie";

@Entity()
export class Chantier {
  @PrimaryGeneratedColumn()
  code: number;

  @Column()
  nom: string;

  @Column()
  adresse: string;

  @ManyToOne(() => Compte, (compte) => compte.chantiers, {
    nullable: true,
    onDelete: "SET NULL",
  })
  compte: Compte;

  @OneToMany(() => Sortie, (sortie) => sortie.chantier)
  sorties: Sortie[];
}
