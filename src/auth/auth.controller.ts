import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  NotFoundException,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LocalAuthGuard } from 'src/guard/local-auth.guard';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RefreshTokenService } from 'src/refresh_token/refresh_token.service';
import { CreateRefreshTokenDto } from 'src/refresh_token/dto/create-refresh_token.dto';
import type { Request, Response } from 'express';
import type { CreateAuthDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly refreshService: RefreshTokenService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.createToken(req.user);
    await this.addTokenOnCookie(res, 'access_token', token.access_token);
    await this.addTokenOnCookie(res, 'refresh_token', token.refresh_token);
    this.authService.login(req.user);
    return { messeage: 'Login successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/login-refresh')
  async loginRefresh(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const dateAccess = new Date(req.user.exp * 1000);
    const getRefreshTokenFromCookie = req.cookies['refresh_token']; // bearer <token>
    const getAccessTokenFromCookie = req.cookies['access_token']; // bearer <token>

    // console.log(refreshToken);
    const newToken = await this.authService.login_refresh(
      dateAccess,
      getRefreshTokenFromCookie,
    );
    //chưa hết hạn
    if (newToken === false) {
      return;
    }
    // update
    await this.addTokenOnCookie(res, 'access_token', newToken?.access_token);
    await this.addTokenOnCookie(res, 'refresh_token', newToken?.refresh_token);

    return newToken;
  }

  async addTokenOnCookie(res: Response, cookieName: any, token: any) {
    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', //Chỉ gửi cookie qua HTTPS nếu đang ở môi trường production
      sameSite: 'strict', //Ngăn chặn cookie được gửi trong request từ domain khác (chống CSRF)
      path: '/',
    });
  }
  // @UseGuards(JwtAuthGuard)
  @Post('/logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // console.log('req.user' + req.user);
    const getRefreshTokenFromCookie = req.cookies['refresh_token']; // bearer <token>
    const getAccessTokenFromCookie = req.cookies['access_token']; // bearer <token>
    // console.log(getRefreshTokenFromCookie);
    await this.authService.logout(getRefreshTokenFromCookie);
    if (!getRefreshTokenFromCookie || !getAccessTokenFromCookie) {
      throw new NotFoundException('Not found cookie');
    }
    res.clearCookie('access_token', {
      httpOnly: true,
      path: '/',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      path: '/',
    });
    return { message: 'logout successful' };
  }

  // @UseGuards(LocalAuthGuard)
  @Get('/send-code')
  async forgotPass(@Body() authDTO: CreateAuthDto) {
    const mail = await this.authService.sendConfirmCodePassword(authDTO);
    return {
      messege: 'success',
      mail,
    };
  }

  @Post('/forgot-password')
  async entercode(@Body() authDTO: CreateAuthDto) {
    const code = await this.authService.resetPasswordWithCode(authDTO);
    // if (code === false) {
    //   return { messege: 'Password and confirm password do not match' };
    // }
    return code;
  }
}
