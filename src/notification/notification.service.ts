import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { AtGuard } from 'src/common/guards';

UseGuards(AtGuard);
@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  onModuleInit() {
    this.eventEmitter.on(
      'notification.create',
      (data: { userId: number; notification: CreateNotificationDto }): void => {
        this.create(data.userId, data.notification).catch((error) => {
          console.error('Error creating notification:', error);
        });
      },
    );
  }

  async create(userId: number, dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        ...dto,
        userId,
        payload: dto.payload ?? {},
      },
    });

    this.eventEmitter.emit('notification.sent', {
      userId,
      notification,
    });

    return notification;
  }

  async getUserNotifications(
    userId: number,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false,
  ) {
    const where = { userId };
    if (unreadOnly) where['read'] = false;

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async markAsRead(userId: number, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId },
      data: { read: true },
    });
  }
}
