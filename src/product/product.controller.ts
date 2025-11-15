import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { UUID } from 'crypto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('addProduct')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('idProduct') idProduct: UUID) {
    return this.productService.findOne(idProduct);
  }

  @Patch(':id')
  update(
    @Param('id') idProduct: UUID,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(idProduct, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') idProduct: UUID) {
    return this.productService.remove(idProduct);
  }
}
