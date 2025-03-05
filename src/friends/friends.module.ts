import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { AtStrategy, RtStrategy } from 'src/auth/strategies';

@Module({
  controllers: [FriendsController],
  providers: [FriendsService, AtStrategy, RtStrategy],
})
export class FriendsModule {}
