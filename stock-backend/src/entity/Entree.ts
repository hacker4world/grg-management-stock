import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Article } from "./Article";
import { Fournisseur } from "./Fournisseur";
import { Fabriquant } from "./Fabriquant";
import { Document } from "./Document";
import { Compte } from "./Compte"; // Import Compte entity
import { EntreeArticleItem } from "./EntreeArticleItem";

@Entity()
export class Entree {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date" })
  date: string;

  @Column({ type: "text", nullable: true })
  observation: string | null;

  @Column({ type: "varchar", length: 20, default: "pending" })
  status: "pending" | "confirmed" | "denied";

  @ManyToOne(() => Fournisseur, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "fournisseurId" })
  fournisseur: Fournisseur;

  @ManyToOne(() => Fabriquant, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "fabriquantId" })
  fabriquant: Fabriquant;

  // New Relationship: One Entree belongs to one Compte (Responsable Chantier)
  @ManyToOne(() => Compte, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "compteId" })
  compte: Compte;

  @OneToMany(() => Document, (d) => d.entree)
  documents: Document[];

  @OneToMany(() => EntreeArticleItem, (e) => e.entree)
  entreeArticleItems: EntreeArticleItem[];
}
