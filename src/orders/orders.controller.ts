import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
// import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add-order')
  create(@Request() req: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create({ ...createOrderDto }, req.payload.idUser);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.ordersService.update(id, updateOrderDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
