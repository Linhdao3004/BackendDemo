import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OrderItemService } from './order-item.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import type { UUID } from 'crypto';

@Controller('order-item')
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  @Post('addOrderItem')
  create(@Body() createOrderItemDto: CreateOrderItemDto) {
    return this.orderItemService.create(createOrderItemDto);
  }

  @Get()
  findAll() {
    return this.orderItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') idOrderItem: UUID) {
    return this.orderItemService.findOne(idOrderItem);
  }

  @Patch(':id')
  update(
    @Param('id') idOrderItem: UUID,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
  ) {
    return this.orderItemService.update(idOrderItem, updateOrderItemDto);
  }

  @Delete(':id')
  remove(@Param('id') idOrderItem: UUID) {
    return this.orderItemService.remove(idOrderItem);
  }
}
