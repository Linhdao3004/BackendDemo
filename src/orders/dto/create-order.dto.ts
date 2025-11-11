import {
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CreateOrderItemDto } from 'src/order-item/dto/create-order-item.dto';
import { Type } from 'class-transformer';
export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  status: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];
}
