import { Order } from '../../orders/entities/order.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  idPayment: string;

  @Column({ default: 'offline' })
  method: string;

  @Column('decimal', { precision: 11, scale: 2 })
  amount: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  transactionId: string;

  @OneToOne(() => Order, (order) => order.payment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idOrder' })
  order: Order;

  @Column('uuid')
  idOrder: string;
}
