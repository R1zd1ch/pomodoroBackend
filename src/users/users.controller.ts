import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AtGuard, IRequest } from 'src/common/guards';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@UseGuards(AtGuard)
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req: IRequest) {
    return this.usersService.getUserProfile(+req.user.sub);
  }

  @Patch('me')
  updateProfile(@Req() req: IRequest, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(+req.user.sub, dto);
  }

  @Post('create')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Patch('me/settings')
  updateSettings(@Req() req: IRequest, @Body() dto: UpdateSettingsDto) {
    return this.usersService.updateUserSettings(+req.user.sub, dto);
  }

  @Delete('me')
  deleteProfile(@Req() req: IRequest) {
    return this.usersService.deleteUser(+req.user.sub);
  }

  @Get('search')
  searchUsers(@Req() req: IRequest) {
    return this.usersService.searchUsers(req.user.sub);
  }
}
