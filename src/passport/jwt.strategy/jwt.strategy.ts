import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from 'src/auth/auth.service';
import { Auth } from 'src/auth/entities/auth.entity';
import { cookieExtractor } from 'src/middleware/middleware';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_SECRET as string,
      // passReqToCallback: true, // nhan req
    });
  }
  async validate(payload: any) {
    // payload chính là nội dung bạn "sign" trong token (ví dụ: { sub, username })
    // Hàm này phải return ra user object mà bạn muốn gắn vào req.user
    // console.log(access_token.access_token);
    // console.log(token);

    return {
      idUser: payload.sub,
      username: payload.username,
      exp: payload.exp,
    };
  }
}
