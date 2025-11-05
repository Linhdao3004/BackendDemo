import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { randomUUID } from 'crypto';
import { CartItem } from './entities/cart-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/product/entities/product.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class CartItemService {
  @InjectRepository(CartItem)
  private readonly cartItemRepository: Repository<CartItem>;
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;
  @InjectRepository(Product)
  private readonly productRepository: Repository<Product>;
  async create(createCartItemDto: CreateCartItemDto): Promise<any> {
    // validate data type UUID of user
    if (!isUUID(createCartItemDto.idUser)) {
      throw new NotFoundException(`Id of user ${createCartItemDto.idProduct} `);
    }
    const user = await this.userRepository.findOneBy({
      idUser: createCartItemDto.idUser,
    });
    const product = await this.productRepository.findOneBy({
      idProduct: createCartItemDto.idProduct,
    });
    // check user có tồn tại không
    if (!user) {
      throw new NotFoundException(
        `User with id ${createCartItemDto.idUser} not found`,
      );
    }
    // check product có tồn tại không
    if (!product) {
      throw new NotFoundException(
        `Product with id ${createCartItemDto.idProduct} not found`,
      );
    }
    console.log(`IsProduct:${createCartItemDto.idProduct} not type data UUID`);
    const cart = this.cartItemRepository.create({
      idCartItem: randomUUID(),
      ...createCartItemDto,
    });
    return this.cartItemRepository.save(cart);
  }

  findAll() {
    return this.cartItemRepository.find();
  }

  findOne(idCartItem: string) {
    return this.cartItemRepository.findOneBy({ idCartItem });
  }

  update(idCartItem: string, updateCartItemDto: UpdateCartItemDto) {
    return `This action updates a #${idCartItem} cartItem`;
  }

  remove(idCartItem: string) {
    return this.cartItemRepository.delete(idCartItem);
  }
}
