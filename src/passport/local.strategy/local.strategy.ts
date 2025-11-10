import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService) {
    super();
  }

  async validate(username: string, password: string) {
    const user = await this.userService.validateLogin(username, password);
    if (!user) {
      throw new NotFoundException(`local`);
    }
    return user;
  }
}
