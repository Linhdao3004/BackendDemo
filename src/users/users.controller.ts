import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { UUID } from 'crypto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // nhìn t giải thích
  //con cái route này là phương thức POST,m truyền /regggister thì có nghĩa là /usẻ/register với phương thức POST. Mà post thì là phương thcws thao tac voi duex liệu. Ko phải để ấy ddataa nên khi m /user/regisster m phải truyền boddy cho nó
  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  // trong định nghĩa hàm create m có @body có nghia là phải truyền body vào
  // ở đây là phương thức get mà m ko truyền cái gì, có nghĩa là nó lấy cái route mc định m truyền trên controller lên là /users. Nên khi m /usé nó sẽ gọi cái này
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // ở hàm get này m có truyền :id thì có nghĩa là /user/id
  @Get(':id')
  findOne(@Param('id') id: UUID) {
    return this.usersService.findOne(id);
  }

  // patch cũng là phương thức làm việc với dữ liệu tương tự get nhưng với ý nghĩa khác. GET được định nghĩa là phương thức lấy dữ liệu. Nên chỉ lấy dữ liệu. PUT PATCH DELETE như tên của nó. DELETE là xóa dữ liệu, PUT PATCH là cập nhật dữ liệu
  @Patch(':id')
  update(@Param('id') id: UUID, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete()
  removeAll() {
    return this.usersService.removeAll();
  }
  @Delete(':id')
  remove(@Param('id') id: UUID) {
    return this.usersService.remove(id);
  }
}
