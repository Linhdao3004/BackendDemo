import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from 'src/refresh_token/entities/refresh_token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRefreshTokenDto } from 'src/refresh_token/dto/create-refresh_token.dto';
import { randomUUID } from 'crypto';
import { RefreshTokenService } from 'src/refresh_token/refresh_token.service';
import { Auth } from './entities/auth.entity';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    private readonly refreshService: RefreshTokenService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async login(user: any) {
    const payload = { sub: user.idUser, username: user.username };
    // payload signature and then create token
    const token = {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '1d' }),
    };
    return token;
  }

  async createReFreshToken(
    createRefreshTokenDto: CreateRefreshTokenDto,
    user: any,
  ): Promise<any> {
    const refresh_token = await this.login(user);
    const secretEnv = this.configService.get<string>('JWT_SECRET');
    const payload = this.jwtService.verify(refresh_token.refresh_token, {
      secret: secretEnv,
    });
    const createReFreshToken = await this.refreshService.create(
      createRefreshTokenDto,
      user,
      refresh_token,
      secretEnv,
      payload,
    );
    return createReFreshToken;
  }
  // IsToken(token: string) {
  //   try {
  //     const secretCode = this.configService.get<string>('JWT_SECRET');
  //     const checkToken = this.jwtService.verify(token, {
  //       secret: secretCode,
  //     });
  //     return {
  //       expired: false,
  //     };
  //   } catch (error) {
  //     if (error.name === 'TokenExpiredError') {
  //       return {
  //         expired: true,
  //       };
  //     }
  //     throw new UnauthorizedException('Invalid token');
  //   }
  // }

  checkTokenDateOfUser(token: string) {
    try {
      const secretCode = this.configService.get<string>('JWT_SECRET');
      const checkToken = this.jwtService.verify(token, {
        secret: secretCode,
      });
      return {
        expired: false,
        checkToken,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return { expired: true, message: 'Token has expired' };
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
