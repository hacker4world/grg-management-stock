// entity/Depot.ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Sortie } from "./Sortie";

@Entity()
export class Depot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  adresse: string | null;

  @OneToMany(() => Sortie, (sortie) => sortie.depot)
  sorties: Sortie[];
}
