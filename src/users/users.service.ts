import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID, type UUID } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create({
      id: randomUUID(),
      ...createUserDto,
    });
    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: UUID) {
    return `This action returns a #${id} user`;
  }

  update(id: UUID, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: UUID) {
    return `This action removes a #${id} user`;
  }
}
