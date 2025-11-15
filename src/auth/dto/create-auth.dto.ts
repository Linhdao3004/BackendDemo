import { IsEmail, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty()
  @IsString()
  username: string;
  @IsNumber()
  @IsNotEmpty()
  confirmationCode: number;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
  @IsNotEmpty()
  @IsString()
  newPasswordconfirmation: string;
}
