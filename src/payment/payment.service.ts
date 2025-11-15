import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { randomUUID } from 'crypto';
import {
  VNPay,
  ProductCode,
  HashAlgorithm,
  VnpLocale,
  ignoreLogger,
  dateFormat,
} from 'vnpay';

@Injectable()
export class PaymentService {
  @InjectRepository(Payment)
  private readonly paymentRepository: Repository<Payment>;
  @InjectRepository(Order)
  private readonly orderRepository: Repository<Order>; // Assuming Order entity is defined elsewhere

  async create(createPaymentDto: CreatePaymentDto) {
    const order = await this.orderRepository.findOneBy({
      idOrder: createPaymentDto.idOrder,
    });

    if (!order) {
      throw new NotFoundException(
        `Order with id ${createPaymentDto.idOrder} not found`,
      );
    }
    const date = new Date();

    // VNPay configuration
    const vnpay = new VNPay({
      tmnCode: 'WRC28TLZ',
      // tmnCode: process.env.VNP_TMNCODE!,
      secureSecret: 'EPXUYDSUWLEFQ404GI2LSFPQ96UJ0MJ3',
      vnpayHost: 'https://sandbox.vnpayment.vn',
      // secureSecret: process.env.VNP_HashSecret!,
      testMode: true,
      hashAlgorithm: HashAlgorithm.SHA512,
      loggerFn: ignoreLogger,
    });
    const tomorow = new Date();
    tomorow.setDate(tomorow.getDate() + 1);
    const paymentURL = vnpay.buildPaymentUrl({
      vnp_Amount: order.totalAmount * 100,
      vnp_IpAddr: '127.0.0.1',
      vnp_TxnRef: order.idOrder,
      vnp_OrderInfo: encodeURIComponent(`Payment for order ${order.idOrder}`),
      vnp_ReturnUrl: `http://localhost:3000/payment/payment-vnpay`,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(date),
      vnp_ExpireDate: dateFormat(tomorow),
    });

    const payment = this.paymentRepository.create({
      idPayment: randomUUID(),
      ...createPaymentDto,
    });

    console.log(dateFormat(date).toString());
    // console.log(date);

    return paymentURL;
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
