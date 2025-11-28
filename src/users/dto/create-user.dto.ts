import { IsEmail, IsNotEmpty, IsString, IsDate, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../enums/role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsDate()
  birthday: Date;

  // AI bổ sung
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
  // AI bổ sung

}
