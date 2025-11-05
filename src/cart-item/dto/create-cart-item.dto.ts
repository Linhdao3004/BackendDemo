import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateCartItemDto {
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  idProduct: string;

  @IsUUID()
  @IsNotEmpty()
  @IsString()
  idUser: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
