import { IsNotEmpty, IsNumber, IsDate, IsString } from 'class-validator';
export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @IsNotEmpty()
  @IsString()
  idUser: string;

  @IsNotEmpty()
  @IsString()
  status: string;
}
