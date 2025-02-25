import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AtStrategy, RtStrategy } from 'src/auth/strategies';

@Module({
  controllers: [TasksController],
  providers: [TasksService, AtStrategy, RtStrategy],
})
export class TasksModule {}
