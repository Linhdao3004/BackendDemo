import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RefreshTokenService } from './refresh_token.service';
import { CreateRefreshTokenDto } from './dto/create-refresh_token.dto';
import { UpdateRefreshTokenDto } from './dto/update-refresh_token.dto';
import { LocalAuthGuard } from 'src/guard/local-auth.guard';

@Controller('refresh-token')
export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  @Get('/refresh')
  findAll() {
    return this.refreshTokenService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.refreshTokenService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRefreshTokenDto: UpdateRefreshTokenDto,
  ) {
    return this.refreshTokenService.update(+id, updateRefreshTokenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.refreshTokenService.remove(+id);
  }
}
