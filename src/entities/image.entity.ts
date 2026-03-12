import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Product } from "./product.entity";

@Entity("images")
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  provider: string; // e.g., 'cloudinary', 's3'

  @Column({ type: "text" })
  url: string;

  @Column()
  providerKey: string; // publicId for Cloudinary, Key for S3

  @Column({ nullable: true })
  productId: number;

  @ManyToOne(() => Product, (product) => product.images, { nullable: true })
  @JoinColumn({ name: "productId" })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
