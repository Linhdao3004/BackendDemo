import { Injectable } from '@nestjs/common';
import { CreateRefreshTokenDto } from './dto/create-refresh_token.dto';
import { UpdateRefreshTokenDto } from './dto/update-refresh_token.dto';
import { RefreshToken } from './entities/refresh_token.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}
  async create(
    createRefreshTokenDto: CreateRefreshTokenDto,
    user: any,
    refresh_token: any,
    secretEnv: any,
    payload: any,
  ): Promise<RefreshToken> {
    const expired = new Date(payload.exp * 1000);
    const refresh = this.refreshTokenRepository.create({
      refreshId: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: expired,
      token: refresh_token.refresh_token,
      ...createRefreshTokenDto,
      userId: payload.sub,
    });
    return this.refreshTokenRepository.save(refresh);
  }

  findAll() {
    return this.refreshTokenRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} refreshToken`;
  }

  update(id: number, updateRefreshTokenDto: UpdateRefreshTokenDto) {
    return `This action updates a #${id} refreshToken`;
  }

  remove(id: number) {
    return `This action removes a #${id} refreshToken`;
  }
}
