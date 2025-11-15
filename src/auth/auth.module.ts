import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../passport/jwt.strategy/jwt.strategy';
import { LocalStrategy } from 'src/passport/local.strategy/local.strategy';
import { RefreshTokenModule } from 'src/refresh_token/refresh_token.module';
import { Auth } from './entities/auth.entity';
import { RefreshToken } from 'src/refresh_token/entities/refresh_token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Module({
  controllers: [AuthController],
  imports: [
    UsersModule,
    PassportModule,
    RefreshTokenModule,
    TypeOrmModule.forFeature([Auth, RefreshToken, User]),
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // mã bí mật JWT
        signOptions: { expiresIn: '1m' }, //thời gian hết token
      }),
    }),
  ],
  exports: [AuthService],
  providers: [AuthService, JwtStrategy, LocalStrategy],
})
export class AuthModule {}
