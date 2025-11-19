import { IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  status: string;

  @IsString()
  transactionId: string;
}
