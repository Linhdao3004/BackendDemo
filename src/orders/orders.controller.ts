import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import type { Request } from 'express';
// import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // truyền token vào lấy payload thông qua passport/jwt.strategy.ts
  // @UseGuards(JwtAuthGuard)
  @Post('add-order')
  create(
    @Req() req: Request,
    @Body() createOrderDto: any,
    @Body() paymentDto: any,
  ) {
    const access_token = req.cookies['access_token'];
    if (!access_token) {
      throw new BadRequestException('Login please!');
    }
    // console.log(req.user.idUser);

    return this.ordersService.createOrderForManualPayment(
      { ...createOrderDto },
      paymentDto,
      access_token,
    );
  }

  @Post('/cancell-order/:id')
  async cancellOrder(
    @Param('id') idOrder: any,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    await this.ordersService.cancellOrder(createOrderDto, idOrder);
    return { message: `You cancelled order ${idOrder}` };
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Post('order-item')
  findAllOrderItem() {
    return this.ordersService.findAllOrderItem();
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

  @Delete()
  removeAll() {
    return this.ordersService.removeAll();
  }
}
