import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { RolesGuard } from '../guard/roles.guard';
import { Roles } from '../guard/roles.decorator';
import { Role } from '../enums/role.enum';
import type { UUID } from 'crypto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
    constructor(private readonly usersService: UsersService) { }

    @Get('users')
    getAllUsers() {
        return this.usersService.findAll();
    }

    @Get('users/:id')
    getUser(@Param('id') idUser: UUID) {
        return this.usersService.findByUserId(idUser);
    }

    @Patch('users/:id/role')
    updateUserRole(@Param('id') idUser: UUID, @Body('role') role: Role) {
        return this.usersService.update(idUser, { role });
    }

    @Delete('users/:id')
    deleteUser(@Param('id') id: UUID) {
        return this.usersService.remove(id);
    }

    @Get('stats')
    async getStats() {
        const users = await this.usersService.findAll();
        return {
            totalUsers: users.length,
            adminUsers: users.filter((u: any) => u.role === Role.ADMIN).length,
            regularUsers: users.filter((u: any) => u.role === Role.USER).length,
        };
    }
}
