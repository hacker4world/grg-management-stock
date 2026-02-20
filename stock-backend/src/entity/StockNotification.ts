import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Article } from "./Article";

export type NotificationType = "low_stock" | "out_of_stock";

@Entity()
export class StockNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50 })
  type: NotificationType;

  @Column({ type: "varchar", length: 500 })
  message: string;

  @ManyToOne(() => Article, { onDelete: "CASCADE" })
  @JoinColumn({ name: "articleId" })
  article: Article;

  @Column({ type: "int" })
  stockActuel: number;

  @Column({ type: "int" })
  stockMinimum: number;

  @Column({ type: "boolean", default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
