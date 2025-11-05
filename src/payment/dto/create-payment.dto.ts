import { IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  idOrder: string;

  @IsString()
  method: string;

  @IsNumber()
  amount: number;

  @IsString()
  status: string;

  @IsString()
  transactionId: string;
}
