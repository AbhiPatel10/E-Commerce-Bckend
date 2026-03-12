import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Order } from "./order.entity";
import { Refund } from "./refund.entity";

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
  CANCELED = "CANCELED",
}

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  orderId: number;

  @OneToOne(() => Order, (order) => order.payment, { nullable: true })
  @JoinColumn({ name: "orderId" })
  order: Order;

  @Column({ unique: true })
  stripePaymentId: string; // Stripe PaymentIntent ID (pi_...)

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ default: "usd" })
  currency: string;

  @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: "json", nullable: true })
  metadata: any;

  @Column({ nullable: true })
  customerEmail: string; // Store email for guest checkout tracking before order

  @OneToMany(() => Refund, (refund) => refund.payment)
  refunds: Refund[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
