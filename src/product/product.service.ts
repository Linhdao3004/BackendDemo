import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) { }
  create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create({
      idProduct: randomUUID(),
      ...createProductDto,
    });
    return this.productRepository.save(product);
  }

  findAll() {
    return this.productRepository.find();
  }

  findOne(idProduct: string) {
    return this.productRepository.findOneBy({ idProduct });
  }

  update(idProduct: string, updateProductDto: UpdateProductDto) {
    return this.productRepository.update(idProduct, updateProductDto);
  }

  remove(idProduct: string) {
    return this.productRepository.delete(idProduct);
  }
  removeAll() {
    return this.productRepository.clear();
  }
}
