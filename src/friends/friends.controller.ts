import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AtGuard, IRequest } from 'src/common/guards';
import { FriendshipStatus } from '@prisma/client';

@UseGuards(AtGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('request/:userId')
  sendRequest(@Req() req: IRequest, @Param('userId') receiverId: string) {
    const senderId = req.user.sub;
    return this.friendsService.sendFriendRequest(+senderId, +receiverId);
  }

  @Post('respond/:id')
  respondToRequest(
    @Req() req: IRequest,
    @Param('id') friendshipId: string,
    @Body('status') status: FriendshipStatus,
  ) {
    const userId = req.user.sub;
    return this.friendsService.respondToRequest(+userId, friendshipId, status);
  }

  @Get()
  getFriends(@Req() req: IRequest) {
    return this.friendsService.getFriends(+req.user.sub);
  }

  @Delete(':id')
  removeFriend(@Req() req: IRequest, @Param('id') friendshipId: string) {
    return this.friendsService.removeFriend(+req.user.sub, friendshipId);
  }
}
