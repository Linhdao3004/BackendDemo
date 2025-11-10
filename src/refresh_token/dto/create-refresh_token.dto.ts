import { Injectable } from '@nestjs/common';
import { IsBoolean, IsDate, IsNotEmpty, IsString } from 'class-validator';

@Injectable()
export class CreateRefreshTokenDto {
  @IsBoolean()
  isRevoked: boolean;
}
