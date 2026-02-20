import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Chantier } from "./Chantier";

@Entity()
export class Compte {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column()
  nom_utilisateur: string;

  @Column()
  motdepasse: string;

  @Column()
  confirme: boolean;

  @Column({ default: "" })
  role: string;

  @OneToMany(() => Chantier, (chantier) => chantier.compte)
  chantiers: Chantier[];
}
