import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID, type UUID } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }
  async create(createUserDto: CreateUserDto): Promise<User> {
    const userCheck = await this.findByUserName(createUserDto.username);
    if (userCheck) {
      throw new NotFoundException(`Account already exists `);
    }
    const passHasSync = bcrypt.hashSync(createUserDto.password, 10);
    const user = this.usersRepository.create({
      idUser: randomUUID(),
      ...createUserDto,
    });
    user.password = passHasSync;

    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find();
  }

  findByUserId(idUser: string) {
    return this.usersRepository.findOneBy({ idUser });
  }

  findByUserName(username: string) {
    return this.usersRepository.findOneBy({ username });
  }

  async validateLogin(username: string, password: string) {
    const user = await this.findByUserName(username);
    if (!user) {
      throw new NotFoundException(`Incorrect username or password`);
    }

    // Convert the 'Convert the user input data' into a 'hashed data' value. then it will compare new hashed data with old hashed data in db
    const checkPass = bcrypt.compareSync(password, user.password);
    if (!checkPass) {
      throw new NotFoundException(`Incorrect username or password`);
    }
    return user;
  }

  update(id: UUID, updateUserDto: UpdateUserDto) {
    return this.usersRepository.update(id, updateUserDto);
  }

  remove(id: UUID) {
    return this.usersRepository.delete(id);
  }

  removeAll() {
    return this.usersRepository.clear();
  }
}
