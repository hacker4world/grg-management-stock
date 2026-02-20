import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { SousFamille } from "./SousFamille";

@Entity()
export class Famille {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @OneToMany(() => SousFamille, (sous_famille) => sous_famille.famille)
  sous_familles: SousFamille[];
}
