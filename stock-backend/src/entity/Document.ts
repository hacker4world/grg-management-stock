import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Entree } from "./Entree";
import { DemandeArticle } from "./DemandeArticle";
import { Sortie } from "./Sortie";
import { RetourArticle } from "./RetourArticle";

export type DocumentType = "fiche_expedition" | "bande_commande" | "bande_livraison" | "bon_de_retour" | "documents_zip";

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50 })
  type: DocumentType;

  @Column({ type: "varchar", length: 255 })
  filename: string;

  @Column({ type: "varchar", length: 255 })
  originalName: string;

  @Column({ type: "varchar", length: 500 })
  path: string;

  @Column({ type: "varchar", length: 100 })
  mimeType: string;

  @Column({ type: "int", unsigned: true })
  size: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Entree, (e) => e.documents, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "entreeId" })
  entree: Entree | null;

  @ManyToOne(() => DemandeArticle, (d) => d.documents, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "demandeArticleId" })
  demandeArticle: DemandeArticle | null;

  @ManyToOne(() => Sortie, (s) => s.documents, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "sortieId" })
  sortie: Sortie | null;

  @ManyToOne(() => RetourArticle, (r) => r.documents, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "retourId" })
  retour: RetourArticle | null;
}
