import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FriendshipStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async sendFriendRequest(senderId: number, receiverId: number) {
    if (senderId === receiverId) {
      throw new ForbiddenException(
        'You cannot send a friend request to yourself',
      );
    }

    const existingFriendRequest = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: senderId, friendId: receiverId },
          { userId: receiverId, friendId: senderId },
        ],
        status: FriendshipStatus.PENDING,
      },
    });

    if (existingFriendRequest) {
      throw new ForbiddenException('Request already exsist');
    }

    const friendship = await this.prisma.friendship.create({
      data: {
        userId: senderId,
        friendId: receiverId,
        status: FriendshipStatus.PENDING,
      },
      include: { user: true, friend: true },
    });

    this.eventEmitter.emit('notification.create', {
      userId: receiverId,
      dto: {
        type: 'FRIEND_REQUEST',
        message: `${friendship.user.name} sent you a friend request`,
        payload: { friendshipId: friendship.id, senderId: senderId },
      },
    });

    return friendship;
  }

  async respondToRequest(
    userId: number,
    friendshipId: string,
    status: FriendshipStatus,
  ) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship || friendship.friendId !== userId) {
      throw new NotFoundException('Friend request not found');
    }

    return this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status },
      include: { user: true, friend: true },
    });
  }
  async getFriends(userId: number) {
    return await this.prisma.friendship.findMany({
      where: {
        OR: [
          { userId, status: FriendshipStatus.ACCEPTED },
          { friendId: userId, status: FriendshipStatus.ACCEPTED },
        ],
      },

      //Todo оптимизировать
      include: { user: true, friend: true },
    });
  }

  async removeFriend(userId: number, friendshipId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (
      !friendship ||
      (friendship.friendId !== userId && friendship.userId !== userId)
    ) {
      throw new NotFoundException('Friend request not found');
    }

    return this.prisma.friendship.delete({
      where: { id: friendshipId },
    });
  }
}
