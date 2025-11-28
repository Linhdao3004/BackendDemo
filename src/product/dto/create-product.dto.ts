import { IsString, IsNumber, IsEmpty } from 'class-validator';
export class CreateProductDto {
  @IsString()
  @IsEmpty()
  productName: string;

  @IsNumber()
  @IsEmpty()
  price: number;

  @IsNumber()
  @IsEmpty()
  stock: number;

  @IsString()
  @IsEmpty()
  description: string;

  @IsString()
  @IsEmpty()
  image: string;
}
