import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class OrdersService {
  @InjectRepository(Order)
  private orderRepository: Repository<Order>;
  private userRepository: Repository<User>;
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const IsUser = await this.userRepository.findOneBy({
      idUser: createOrderDto.idUser,
    });

    if (!IsUser) {
      throw new NotFoundException(`User not found id:${createOrderDto.idUser}`);
    }
    const order = this.orderRepository.create({
      idOrder: randomUUID(),
      ...createOrderDto,
    });
    return this.orderRepository.save(order);
  }

  findAll() {
    return this.orderRepository.find();
  }

  findOne(idOrder: string) {
    return this.orderRepository.findOneBy({ idOrder });
  }

  update(idOrder: string, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${idOrder} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
