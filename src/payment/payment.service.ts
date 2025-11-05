import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentService {
  @InjectRepository(Payment)
  private readonly paymentRepository: Repository<Payment>;
  private readonly orderRepository: Repository<Order>; // Assuming Order entity is defined elsewhere

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const isOrder = await this.orderRepository.findOne({
      where: { idOrder: createPaymentDto.idOrder },
    });

    if (!isOrder) {
      throw new NotFoundException(
        `Order with id ${createPaymentDto.idOrder} not found`,
      );
    }

    const payment = this.paymentRepository.create({
      idPayment: randomUUID(),
      ...createPaymentDto,
    });

    return this.paymentRepository.save(payment);
  }

  findAll() {
    return this.paymentRepository.find();
  }

  findOneById(idPayment: string) {
    return this.paymentRepository.findOneBy({ idPayment });
  }

  update(idPayment: string, updatePaymentDto: UpdatePaymentDto) {
    return this.paymentRepository.update({ idPayment }, updatePaymentDto);
  }

  remove(idPayment: string) {
    return this.paymentRepository.delete({ idPayment });
  }
}
