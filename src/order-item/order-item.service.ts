import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from './entities/order-item.entity';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import type { Product } from 'src/product/entities/product.entity';

@Injectable()
export class OrderItemService {
  @InjectRepository(OrderItem)
  private readonly orderItemRepository: Repository<OrderItem>;
  private readonly productRepository: Repository<Product>;

  async create(createOrderItemDto: CreateOrderItemDto): Promise<OrderItem> {
    const InfoProduct = await this.productRepository.findOneBy({
      idProduct: createOrderItemDto.idProduct,
    });
    if (!InfoProduct) {
      throw new NotFoundException(
        `Product with id ${createOrderItemDto.idProduct} not found`,
      );
    }
    const orderItem = this.orderItemRepository.create({
      idOrderItem: randomUUID(),
      ...createOrderItemDto,
    });
    return this.orderItemRepository.save(orderItem);
  }

  findAll() {
    return this.orderItemRepository.find();
  }

  findOne(idOrderItem: string) {
    return this.orderItemRepository.findOneBy({ idOrderItem });
  }

  async update(
    idOrderItem: string,
    updateDto: UpdateOrderItemDto,
  ): Promise<OrderItem> {
    // 1️⃣ Lấy OrderItem cần cập nhật
    const orderItem = await this.orderItemRepository.findOne({
      where: { idOrderItem },
      relations: ['product'],
    });
    if (!orderItem)
      throw new NotFoundException(`OrderItem with id ${idOrderItem} not found`);

    // 2️⃣ Nếu có update productId, validate product tồn tại
    if (updateDto.idProduct) {
      const product = await this.productRepository.findOne({
        where: { idProduct: updateDto.idProduct },
      });
      if (!product)
        throw new BadRequestException(
          `Product with id ${updateDto.idProduct} not found`,
        );
      orderItem.product = product;
      console.log(orderItem);
    }

    // 3️⃣ Update các trường khác từ DTO
    if (updateDto.quantity !== undefined) {
      if (updateDto.quantity <= 0)
        throw new BadRequestException('Quantity must be greater than 0');
      orderItem.quantity = updateDto.quantity;
    }

    // 4️⃣ Lưu vào DB
    return this.orderItemRepository.save(orderItem);
  }

  remove(idOrderItem: string) {
    return this.orderItemRepository.delete({ idOrderItem });
  }
}
