import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { randomUUID } from 'crypto';
import { Repository, type DeepPartial } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { OrderItem } from 'src/order-item/entities/order-item.entity';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class OrdersService {
  @InjectRepository(Order)
  private orderRepository: Repository<Order>;
  @InjectRepository(User)
  private userRepository: Repository<User>;
  @InjectRepository(Product)
  private productRepository: Repository<Product>;

  async create(createOrderDto: CreateOrderDto, userId: string) {
    let Amount = 0;
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
      idUser: userId,
      ...createOrderDto,
      // tạo orderItem cùng lúc với order
      orderItems,
      createdAt: new Date(),
      totalAmount: Amount,
    });
    await this.updateStockOfProduct(createOrderDto);
    return this.orderRepository.save(order);
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
