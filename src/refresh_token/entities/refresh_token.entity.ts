import { User } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  refreshId: string;

  @ManyToOne(() => User, (user) => user.refreshToken, { onDelete: 'CASCADE' })
  user: User;
  @JoinColumn({ name: 'userId' })
  @Column('uuid')
  userId: string;

  @Column()
  token: string;

  @Column({ default: false })
  isRevoked: boolean;

  @Column()
  expiresAt: Date;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
