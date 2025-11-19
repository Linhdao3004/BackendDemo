import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { randomUUID, type UUID } from 'crypto';
import { Repository, DataSource, type DeepPartial } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { OrderItem } from 'src/order-item/entities/order-item.entity';
import { Product } from 'src/product/entities/product.entity';
import { JwtService } from '@nestjs/jwt';
import { Payment } from 'src/payment/entities/payment.entity';
import type { CreatePaymentDto } from 'src/payment/dto/create-payment.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createOrderDto: CreateOrderDto, token: any) {
    let Amount = 0;
    const payloadAccess = await this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
    console.log(payloadAccess);

    for (const item of createOrderDto.orderItems) {
      // console.log(item.idProduct);
      const product = await this.productRepository.findOne({
        where: { idProduct: item.idProduct },
      });
      // console.log(product);

      if (!product) {
        throw new NotFoundException(`Product not found id:${item.idProduct}`);
      }
      if (product.stock <= 0) {
        throw new BadRequestException(
          `Product ${product.productName} is out of stock`,
        );
      }
      if (item.quantity > product.stock) {
        throw new BadRequestException(
          `Product ${product.productName} only has ${product.stock} left`,
        );
      }

      Amount += item.quantity * product.price;
    }
    // console.log(Amount);

    const orderItems: DeepPartial<OrderItem>[] = await Promise.all(
      createOrderDto.orderItems.map(async (item) => {
        const product = await this.productRepository.findOne({
          where: { idProduct: item.idProduct },
        });

        return {
          product, // save full product entity
          quantity: item.quantity,
          productName: product?.productName,
        } as DeepPartial<OrderItem>;
      }),
    );

    const order = this.orderRepository.create({
      idOrder: randomUUID(),
      idUser: payloadAccess.sub,
      ...createOrderDto,
      // tạo orderItem cùng lúc với order
      orderItems,
      createdAt: new Date(),
      totalAmount: Amount,
    });
    await this.updateStockOfProduct(createOrderDto);
    return this.orderRepository.save(order);
  }

  async createOrderForManualPayment(
    createOrderDto: CreateOrderDto,
    paymentDto: CreatePaymentDto,
    token: any,
  ) {
    const queryRuner = this.dataSource.createQueryRunner();
    await queryRuner.connect();
    await queryRuner.startTransaction();
    try {
      const payloadAccess = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      let totalAmount = 0;

      for (const item of createOrderDto.orderItems) {
        const product = await this.productRepository.findOneBy({
          idProduct: item.idProduct,
        });
        if (!product) {
          throw new NotFoundException('Product not found');
        }
        if (!product) {
          throw new NotFoundException('Product not found!');
        }
        if (product.stock <= 0) {
          return { message: `${product.productName} is out of stock` };
        }
        if (product.stock < item.quantity) {
          return {
            message: `${product.productName} only has ${product.stock} left!`,
          };
        }
        totalAmount += product.price * item.quantity;
      }
      console.log(totalAmount);

      const orderItems: DeepPartial<OrderItem>[] = await Promise.all(
        createOrderDto.orderItems.map(async (item) => {
          const product = await this.productRepository.findOneBy({
            idProduct: item.idProduct,
          });

          return {
            product, // save full product entity
            quantity: item.quantity,
            productName: product?.productName,
          } as DeepPartial<OrderItem>;
        }),
      );

      // create order

      const orderId = randomUUID();
      console.log(orderId);

      const order = queryRuner.manager.create(Order, {
        idOrder: orderId,
        idUser: payloadAccess.sub,
        ...createOrderDto,
        orderItems,
        createdAt: new Date(),
        totalAmount: totalAmount,
      });
      await queryRuner.manager.save(order);

      // create order

      // create payment

      const payment = queryRuner.manager.create(Payment, {
        idPayment: randomUUID(),
        amount: totalAmount,
        idOrder: orderId,
        ...paymentDto,
      });
      await queryRuner.manager.save(payment);

      // create payment

      //update stock product
      for (const item of createOrderDto.orderItems) {
        queryRuner.manager.decrement(
          Product,
          { idProduct: item.idProduct },
          'stock',
          item.quantity,
        );
      }
      //update stock product
      await queryRuner.commitTransaction();
      // console.log(payloadAccess);
    } catch (error) {
      console.log(error);
    }
  }

  // cancel order
  async cancellOrder(createOrderDto: CreateOrderDto, idOrder: UUID) {
    const queryRuner = this.dataSource.createQueryRunner();
    await queryRuner.connect();
    await queryRuner.startTransaction();
    try {
      const order = await this.orderRepository.findOne({
        where: { idOrder: idOrder },
        relations: ['orderItems', 'orderItems.product'], // đảm bảo load quan hệ
      });
      console.log(order?.orderItems);

      if (!order) {
        throw new NotFoundException(`Order with id ${idOrder} not found`);
      }
      for (const item of order.orderItems) {
        const product = await this.productRepository.findOneBy({
          idProduct: item.product.idProduct,
        });
        console.log(product);

        if (!product) {
          throw new NotFoundException('Product not found!');
        }
        await queryRuner.manager.update(
          Product,
          { idProduct: item.product.idProduct },
          { stock: item.quantity + product.stock },
        );
      }
      await queryRuner.manager.update(
        Order,
        { idOrder: idOrder },
        { status: 'Cancelled' },
      );
      // await queryRuner.manager.update(
      //   Payment,
      //   { idOrder: idOrder },
      //   { status: 'Cancelled' },
      // );
      await queryRuner.commitTransaction();
    } catch (error) {
      console.log(error);

      throw new BadRequestException(error);
    }
  }

  async updateStockOfProduct(createOrderDto: CreateOrderDto) {
    for (const item of createOrderDto.orderItems) {
      // console.log(item.idProduct);
      const product = await this.productRepository.findOneBy({
        idProduct: item.idProduct,
      });
      // console.log(product?.stock);
      if (!product) {
        throw new NotFoundException(`Product not found id:${item.idProduct}`);
      }
      const newStock = product.stock - item.quantity;
      await this.productRepository.update(item.idProduct, { stock: newStock });
    }
  }

  async findAll() {
    const orders = await this.orderRepository.find({
      relations: ['orderItems', 'orderItems.product'],
    });

    return orders.map((order) => ({
      idOrder: order.idOrder,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      orderItems: order.orderItems.map((item) => ({
        productName: item.product?.productName,
        quantity: item.quantity,
        price: item.product?.price,
      })),
      status: order.status,
      idUser: order.idUser,
    }));
  }

  findAllOrderItem() {
    return;
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

  removeAll() {
    return this.orderRepository.deleteAll();
  }
}
