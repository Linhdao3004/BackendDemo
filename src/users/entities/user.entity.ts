import { CartItem } from '../../cart-item/entities/cart-item.entity';
import { Order } from '../../orders/entities/order.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  idUser: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  fistName: string;

  @Column()
  lastName: string;

  @Column()
  adress: string;

  @Column()
  birthday: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.user)
  cartItems: CartItem[];
}
