import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AtStrategy, RtStrategy } from 'src/auth/strategies';

@Module({
  providers: [UsersService, AtStrategy, RtStrategy],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
