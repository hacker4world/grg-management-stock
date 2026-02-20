import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Unite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;
}
