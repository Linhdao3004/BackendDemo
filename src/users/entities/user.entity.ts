import { RefreshToken } from '../../refresh_token/entities/refresh_token.entity';
import { Order } from '../../orders/entities/order.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Role } from '../../enums/role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  idUser: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  // AI bổ sung 
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;
  // AI bổ sung 

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  birthday: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshToken: RefreshToken[];

  @Column({ nullable: true })
  confirmCodePass: number;

  @Column({ type: 'timestamp', nullable: true })
  confirmCodePassExpires: Date;
}
