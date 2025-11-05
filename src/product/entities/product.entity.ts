import { CartItem } from '../../cart-item/entities/cart-item.entity';
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

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
  @OneToMany(() => CartItem, (cartItem) => cartItem.products)
  cartItems: CartItem[];

  @Column()
  stock: number;
}
