import { IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateOrderItemDto {
  @IsNumber()
  quantity: number;

  @IsString()
  @IsUUID()
  idProduct: string;

  // @IsString()
  // @IsUUID()
  // idOrder: string;
}
