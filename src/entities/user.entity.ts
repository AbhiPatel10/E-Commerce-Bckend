import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from "typeorm";
import { Order } from "./order.entity";
import { StripeCustomer } from "./stripe-customer.entity";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ default: UserRole.USER })
  role: string;

  @Column({ type: "json", nullable: true })
  addresses: any;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToOne(() => StripeCustomer, (stripeCustomer) => stripeCustomer.user)
  stripeCustomer: StripeCustomer;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
