import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        'ooVTb1COHE3m4ywuvWUQG2Es6dUqubv7IDb3KWKL9VpF+/PDxvWwclTyXH04+deLYgUSUyu+Jx8XJBsGnZhXKSGFZmCJOiu7VudDJQr42dK0ZpAK2yj7m/HHinkLb7ZqOmnHkISGblb3T4WM1MRgk9dZSVLmpz3t7JZr/z6T3w+DEbNRtLQAft4vuODBOe1YmlV4TgBCngQHvI5Ro27Ui/UyOPM+T4QjiwC3LbVZlpE701DokdQK0v43pzEcrsvNPHtV4Mpc9xR4BIHQuGKgL0Tn0QDY3P53fRhzykKdVhcv910+P659ZG2rgj5BFKheYsHZGXRrrKakiMbIMs45Xg==',
    });
  }
  async validate(payload: any) {
    // payload chính là nội dung bạn "sign" trong token (ví dụ: { sub, username })
    // Hàm này phải return ra user object mà bạn muốn gắn vào req.user
    return {
      idUser: payload.sub,
      username: payload.username,
      exp: payload.exp,
    };
  }
}
