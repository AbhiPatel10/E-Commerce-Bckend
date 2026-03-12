import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity("stripe_events")
export class StripeEvent {
  @PrimaryColumn()
  id: string; // Stripe Event ID (evt_...)

  @Column()
  type: string; // payment_intent.succeeded, etc.

  @CreateDateColumn()
  createdAt: Date;
}
