import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { Category } from "./category.entity";
import { Brand } from "./brand.entity";
import { Image } from "./image.entity";
import { CartItem } from "./cart-item.entity";
import { OrderItem } from "./order-item.entity";
import { Review } from "./review.entity";
import { Admin } from "./admin.entity";

export enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: "text", nullable: true })
  shortDescription: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  discountPercentage: number;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  vatPercentage: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ type: "enum", enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @Column()
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: "categoryId" })
  @Index()
  category: Category;

  @Column({ nullable: true })
  @Index()
  brandId: number;

  @ManyToOne(() => Brand, (brand) => brand.products, { nullable: true })
  @JoinColumn({ name: "brandId" })
  brand: Brand;

  @OneToMany(() => Image, (image) => image.product)
  images: Image[];

  @Column({ unique: true })
  slug: string;

  @Column({ type: "json", nullable: true })
  features: any;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @Column({ nullable: true })
  @Index()
  adminId: number;

  @ManyToOne(() => Admin, (admin) => admin.products)
  @JoinColumn({ name: "adminId" })
  admin: Admin;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
