// entity/Sortie.ts
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Chantier } from "./Chantier";
import { ArticleSortie } from "./ArticleSortie";
import { Compte } from "./Compte";
import { Document } from "./Document";
import { Depot } from "./Depot";

export type SortieType = "interne_depot" | "interne_chantier" | "externe";
export type SortieExterneType = "avec_transporteur" | "sans_transporteur";

@Entity()
export class Sortie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date" })
  date: string;

  @Column({ type: "text", nullable: true })
  observation: string;

  /** Type de sortie: "interne_depot", "interne_chantier", ou "externe" */
  @Column({ type: "varchar", length: 30 })
  typeSortie: SortieType;

  // ============ SHARED FIELDS ============
  @OneToMany(() => ArticleSortie, (as) => as.sortie, {
    cascade: true,
    eager: true,
  })
  articleSorties: ArticleSortie[];

  @Column({ type: "varchar", length: 20, default: "pending" })
  status: "pending" | "confirmed" | "denied";

  @ManyToOne(() => Compte, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "compteId" })
  compte: Compte;

  @OneToMany(() => Document, (d) => d.sortie)
  documents: Document[];

  // ============ SORTIE INTERNE DEPOT FIELDS ============
  @ManyToOne(() => Depot, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "depotId" })
  depot: Depot | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  nomTransporteurDepot: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  matriculeTransporteurDepot: string | null;

  // ============ SORTIE INTERNE CHANTIER FIELDS ============
  @ManyToOne(() => Chantier, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "chantierId" })
  chantier: Chantier | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  nomTransporteurChantier: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  matriculeTransporteurChantier: string | null;

  // ============ SORTIE EXTERNE FIELDS ============
  @Column({ type: "varchar", length: 30, nullable: true })
  sousTypeSortieExterne: SortieExterneType | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  nomEntreprise: string | null;

  @Column({ type: "text", nullable: true })
  adresseEntreprise: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  matriculeFiscalEntreprise: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  nomClient: string | null;

  // Transporteur fields (only for "avec_transporteur" sub-type)
  @Column({ type: "varchar", length: 255, nullable: true })
  nomTransporteurExterne: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  matriculeTransporteurExterne: string | null;
}
