import { User } from '../../users/entities/user.entity';
import { Product } from '../../product/entities/product.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  idCartItem: string;

  @Column()
  quantity: number;

  @Column('uuid')
  idProduct: string;

  @Column('uuid')
  idUser: string;

  @ManyToOne(() => Product, (product) => product.cartItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idProduct' })
  products: Product;

  @ManyToOne(() => User, (user) => user.cartItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idUser' })
  user: User;
}
