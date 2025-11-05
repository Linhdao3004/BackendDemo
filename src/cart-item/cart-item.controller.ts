import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import type { UUID } from 'crypto';

@Controller('cart-item')
export class CartItemController {
  constructor(private readonly cartItemService: CartItemService) {}

  @Post('add-cart-item')
  create(@Body() createCartItemDto: CreateCartItemDto) {
    return this.cartItemService.create(createCartItemDto);
  }

  @Get()
  findAll() {
    return this.cartItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') idCartItem: UUID) {
    return this.cartItemService.findOne(idCartItem);
  }

  @Patch(':id')
  update(
    @Param('id') idCartItem: UUID,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartItemService.update(idCartItem, updateCartItemDto);
  }

  @Delete(':id')
  remove(@Param('id') idCartItem: UUID) {
    return this.cartItemService.remove(idCartItem);
  }
}
