import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AtGuard, IRequest } from 'src/common/guards';

@UseGuards(AtGuard)
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
    console.log(id);
    return this.notificationService.markAsRead(+req.user.sub, id);
  }

  @Post('markAllAsRead')
  markAllAsRead(@Req() req: IRequest) {
    return this.notificationService.markAllAsRead(+req.user.sub);
  }
  @Delete('many')
  deleteAllNotifications(@Req() req: IRequest, @Body('ids') ids: string[]) {
    console.log(ids);
    return this.notificationService.deleteManyNotifications(+req.user.sub, ids);
  }
  @Delete(':id')
  deleteNotification(@Req() req: IRequest, @Param('id') id: string) {
    console.log(id);
    return this.notificationService.deleteNotification(+req.user.sub, id);
  }
}
