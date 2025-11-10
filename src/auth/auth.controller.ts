import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LocalAuthGuard } from 'src/guard/local-auth.guard';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RefreshTokenService } from 'src/refresh_token/refresh_token.service';
import type { CreateRefreshTokenDto } from 'src/refresh_token/dto/create-refresh_token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly refreshService: RefreshTokenService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Request() req: any, createRefreshTokenDto: CreateRefreshTokenDto) {
    return this.authService.createReFreshToken(createRefreshTokenDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/check')
  async checkTokenDateOfUser(@Request() req: any) {
    return req.user;
  }
}
