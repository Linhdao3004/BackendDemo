import { OrderItem } from '../../order-item/entities/order-item.entity';
import { User } from '../../users/entities/user.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Payment } from '../../payment/entities/payment.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  idOrder: string;

  @Column({ type: 'float' })
  totalAmount: number;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idUser' })
  user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true, // 👈 để tạo Order + OrderItems cùng lúc
    eager: true, // 👈 tự load items khi query Order
  })
  orderItems: OrderItem[];
  @Column('uuid')
  idUser: string;

  @OneToOne(() => Payment, (payment) => payment.order)
  payment: Payment;

  @Column()
  // @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // chọn thời gian hiện tại
  createdAt: Date;

  @Column()
  status: string;
}
