import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import type { UUID } from 'crypto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('add-payment')
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') idPayment: UUID) {
    return this.paymentService.findOneById(idPayment);
  }

  @Patch(':id')
  update(
    @Param('id') idPayment: UUID,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentService.update(idPayment, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') idPayment: UUID) {
    return this.paymentService.remove(idPayment);
  }
}
