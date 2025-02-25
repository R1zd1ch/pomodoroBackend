import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AtStrategy, RtStrategy } from 'src/auth/strategies';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway, RtStrategy, AtStrategy],
})
export class NotificationModule {}
