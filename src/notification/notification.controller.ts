import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { IRequest } from 'src/common/guards';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getNotifications(
    @Req() req: IRequest,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('unreadOnly') unreadOnly: boolean = false,
  ) {
    return this.notificationService.getUserNotifications(
      +req.user.sub,
      page,
      limit,
      unreadOnly,
    );
  }

  @Patch(':id/read')
  markAsRead(@Req() req: IRequest, @Param('id') id: string) {
    return this.notificationService.markAsRead(+req.user.sub, id);
  }

  @Post('markAllAsRead')
  markAllAsRead(@Req() req: IRequest) {
    return this.notificationService.markAllAsRead(+req.user.sub);
  }
}
