import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Article } from "./Article";
import { Chantier } from "./Chantier";
import { RetourArticleItem } from "./RetourArticleItem";
import { Document } from "./Document";

@Entity()
export class RetourArticle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date" })
  date: string;

  /* one return belongs to one chantier */
  @ManyToOne(() => Chantier, { onDelete: "CASCADE" })
  @JoinColumn({ name: "chantierCode" })
  chantier: Chantier;

  /* one return can contain many lines (article + qty + reason) */
  @OneToMany(() => RetourArticleItem, (item) => item.retour)
  items: RetourArticleItem[];

  @Column({ type: "varchar", length: 20, default: "pending" })
  status: "pending" | "confirmed" | "denied";

  /* documents generated for this retour (Bon de Retour PDF) */
  @OneToMany(() => Document, (d) => d.retour)
  documents: Document[];
  @Column({ type: "text", nullable: true })
  observation?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  nomTransporteur?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  matriculeTransporteur?: string;
}
