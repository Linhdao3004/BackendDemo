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
    private readonly jwtService: JwtService,
  ) {}
  async create(refreshToken: any): Promise<RefreshToken> {
    const secretEnv = process.env.JWT_SECRET;
    const payload = await this.jwtService.verify(refreshToken, {
      secret: secretEnv,
    });
    // console.log(payload);

    const expired = new Date(payload.exp * 1000);
    // console.log(`expired:${expired}`);
    // console.log('jkashckj:' + payload.sub);

    const refresh = this.refreshTokenRepository.create({
      refreshId: randomUUID(),
      idUser: payload.sub,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: expired,
      token: refreshToken,
      // idUser: payload.sub,
    });
    return this.refreshTokenRepository.save(refresh);
  }

  findAll() {
    return this.refreshTokenRepository.find();
  }

  findOne(id: string) {
    return `This action returns a #${id} refreshToken`;
  }

  update(id: string, updateRefreshTokenDto: UpdateRefreshTokenDto) {
    return `This action updates a #${id} refreshToken`;
  }

  remove(refreshId: string) {
    return this.refreshTokenRepository.delete({ refreshId });
  }

  removeAll() {
    return this.refreshTokenRepository.deleteAll();
  }
}
