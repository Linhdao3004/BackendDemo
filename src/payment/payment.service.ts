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
  type VnpCurrCode,
} from 'vnpay';
import { OrderStatus } from 'src/enums/order-status.enum';
import { PaymentStatus } from 'src/enums/payment-status.enum';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class PaymentService {
  @InjectRepository(Payment)
  private readonly paymentRepository: Repository<Payment>;
  @InjectRepository(Order)
  private readonly orderRepository: Repository<Order>; // Assuming Order entity is defined elsewhere
  @InjectRepository(Product)
  private readonly productRepository: Repository<Product>; // Assuming Order entity is defined elsewhere

  // async create(createPaymentDto: CreatePaymentDto) {
  //   const order = await this.orderRepository.findOneBy({
  //     idOrder: createPaymentDto.idOrder,
  //   });

  //   if (!order) {
  //     throw new NotFoundException(
  //       `Order with id ${createPaymentDto.idOrder} not found`,
  //     );
  //   }
  //   const date = new Date();

  //   // VNPay configuration
  //   const vnpay = new VNPay({
  //     tmnCode: 'WRC28TLZ',
  //     vnp_OrderType: ProductCode.Other,
  //     // tmnCode: process.env.VNP_TMNCODE!,
  //     secureSecret: 'EPXUYDSUWLEFQ404GI2LSFPQ96UJ0MJ3',
  //     vnpayHost: 'https://sandbox.vnpayment.vn',
  //     // secureSecret: process.env.VNP_HashSecret!,
  //     testMode: true,
  //     hashAlgorithm: HashAlgorithm.SHA512,
  //     vnp_Version: '2.1.0',
  //     loggerFn: ignoreLogger,
  //   });
  //   const tomorow = new Date();
  //   tomorow.setDate(tomorow.getDate() + 1);
  //   const paymentURL = await vnpay.buildPaymentUrl({
  //     vnp_Amount: order.totalAmount * 100,
  //     vnp_IpAddr: '192.168.1.1',
  //     vnp_TxnRef: '123456',
  //     vnp_OrderInfo: `Payment for order ${order.idOrder}`,
  //     vnp_ReturnUrl: `http://localhost:3000/payment/payment-vnpay`,
  //     vnp_Locale: VnpLocale.VN,
  //     vnp_CreateDate: dateFormat(date),
  //     vnp_ExpireDate: dateFormat(tomorow),
  //     vnp_CurrCode: 'VND' as VnpCurrCode,
  //     vnp_OrderType: ProductCode.Other,
  //   });
  //   console.log(ProductCode.Other);

  //   const payment = this.paymentRepository.create({
  //     idPayment: randomUUID(),
  //     ...createPaymentDto,
  //   });

  //   console.log(dateFormat(date));
  //   // console.log(date);

  //   return paymentURL;
  // }

  async confirmPayment(idPayment: string) {
    const payment = await this.paymentRepository.findOneBy({
      idPayment: idPayment,
    });
    if (!payment) {
      throw new NotFoundException(`Payment id ${idPayment} not found!`);
    }
    const order = await this.orderRepository.findOne({
      where: { idOrder: payment.idOrder },
      relations: ['user', 'orderItems.product'],
    });
    // console.log(order?.orderItems);
    if (!order) {
      throw new NotFoundException(`${payment.idOrder} not found!`);
    }
    if (order?.status === OrderStatus.DELIVERED) {
      payment.status = PaymentStatus.PAID;
      await this.paymentRepository.save(payment);
      return { message: 'Success' };
    }
    // nv ko biet tim payment va bam xac nhan lai
    if (payment.status === PaymentStatus.PAID) {
      return {
        message: `You confirmed payment for ${order?.user.lastName} ${order?.user.fistName}'s order!`,
      };
    }
    // khach hang huy don khi da thanh toan thi hoan tien va tang stock  sp cua don hang huy
    if (
      payment.status === PaymentStatus.PAID &&
      order.status === OrderStatus.CANCELLED
    ) {
      payment.status = PaymentStatus.REFUNDED;
      await this.paymentRepository.save(payment);
      return {
        message: `You confirmed payment for ${order?.user.lastName} ${order?.user.fistName}'s order!`,
      };
    }

    // order da huy(update stock tang len) va update status payment
    if (
      order?.status === OrderStatus.CANCELLED &&
      payment.status === PaymentStatus.PENDING
    ) {
      payment.status = PaymentStatus.CANCELLED;
      await this.paymentRepository.save(payment);
      return { message: `` };
    }

    return { message: "The customer's order is being processed!" };
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
