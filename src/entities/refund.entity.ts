import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Payment } from "./payment.entity";

@Entity("refunds")
export class Refund {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  paymentId: number;

  @ManyToOne(() => Payment, (payment) => payment.refunds)
  @JoinColumn({ name: "paymentId" })
  payment: Payment;

  @Column({ unique: true })
  stripeRefundId: string; // Stripe Refund ID (re_...)

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  reason: string;

  @Column()
  status: string; // succeeded, pending, failed, canceled

  @CreateDateColumn()
  createdAt: Date;
}
