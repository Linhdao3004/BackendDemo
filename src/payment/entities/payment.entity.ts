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

  @Column()
  method: string;

  @Column()
  amount: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  transactionId: string;

  @OneToOne(() => Order, (order) => order.payment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idOrder' })
  order: Order;
}
