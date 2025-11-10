import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './product/product.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemModule } from './order-item/order-item.module';
import { PaymentModule } from './payment/payment.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './passport/jwt.strategy/jwt.strategy';
import { LocalStrategy } from './passport/local.strategy/local.strategy';
import { RefreshTokenModule } from './refresh_token/refresh_token.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres1',
      password: '123456',
      database: 'postgres1',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    ProductModule,
    OrdersModule,
    OrderItemModule,
    PaymentModule,
    AuthModule,
    RefreshTokenModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy, LocalStrategy],
})
export class AppModule {}
