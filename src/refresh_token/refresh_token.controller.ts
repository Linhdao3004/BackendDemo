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
import type { UUID } from 'crypto';

@Controller('refresh-token')
export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  @Get('/refresh')
  findAll() {
    return this.refreshTokenService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') refreshId: UUID) {
    return this.refreshTokenService.findOne(refreshId);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') refreshId: UUID,
  //   @Body() updateRefreshTokenDto: UpdateRefreshTokenDto,
  // ) {
  //   return this.refreshTokenService.update(refreshId, updateRefreshTokenDto);
  // }
  @Delete(':id')
  remove(@Param('id') refreshId: UUID) {
    return this.refreshTokenService.remove(refreshId);
  }

  @Delete()
  removeAll() {
    return this.refreshTokenService.removeAll();
  }
}
