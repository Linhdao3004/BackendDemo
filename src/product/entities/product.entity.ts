import { OrderItem } from '../../order-item/entities/order-item.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  idProduct: string;

  @Column()
  productName: string;

  @Column('decimal', { precision: 11, scale: 2 })
  price: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @Column()
  stock: number;
}
