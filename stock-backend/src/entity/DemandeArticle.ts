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
import { DemandeArticleItem } from "./DemandeArticleItem";
import { Document } from "./Document";

@Entity()
export class DemandeArticle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date" })
  date: string;

  /* one demand belongs to one chantier */
  @ManyToOne(() => Chantier, { onDelete: "CASCADE" })
  @JoinColumn({ name: "chantierCode" })
  chantier: Chantier;

  /* one demand can contain many lines (articles + qty) */
  @OneToMany(() => DemandeArticleItem, (item) => item.demande)
  items: DemandeArticleItem[];

  @Column({ type: "varchar", length: 20, default: "pending" })
  status: "pending" | "confirmed" | "denied";

  @OneToMany(() => Document, (d) => d.demandeArticle)
  documents: Document[];

  @Column({ type: "text", nullable: true })
  observation?: string;
}
  