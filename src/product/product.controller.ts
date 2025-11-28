import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  // AI bổ sung
  UseGuards,
  // AI bổ sung

} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// AI bổ sung
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { RolesGuard } from '../guard/roles.guard';
import { Roles } from '../guard/roles.decorator';
import { Role } from '../enums/role.enum';
import type { UUID } from 'crypto';
// AI bổ sung

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post('addProduct')
  // ========================AI bổ sung========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  // ========================AI bổ sung========================
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') idProduct: UUID) {
    return this.productService.findOne(idProduct);
  }

  @Patch(':id')
  // ========================AI bổ sung========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  // ========================AI bổ sung========================
  update(
    @Param('id') idProduct: UUID,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(idProduct, updateProductDto);
  }

  @Delete(':id')
  // ========================AI bổ sung========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  // ========================AI bổ sung========================
  remove(@Param('id') idProduct: UUID) {
    return this.productService.remove(idProduct);
  }
}
