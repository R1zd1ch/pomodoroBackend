import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from '@prisma/client';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AtGuard, IRequest } from 'src/common/guards';

@Controller('tasks')
@UseGuards(AtGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  createTask(@Req() req: IRequest, @Body() dto: CreateTaskDto) {
    const userId = req.user.sub;

    return this.tasksService.createTask(+userId, dto);
  }

  @Get()
  findAll(
    @Req() req: IRequest,
    @Query('status') status?: TaskStatus,
    @Query('categoryId') categoryId?: string,
  ) {
    const userId = req.user.sub;
    return this.tasksService.getAllUsersTasks(+userId, status, categoryId);
  }

  @Get(':taskId')
  findOne(@Req() req: IRequest, @Param('taskId') taskId: string) {
    const userId = req.user.sub;
    return this.tasksService.getTaskById(+userId, taskId);
  }

  @Patch(':taskId')
  updateTask(
    @Req() req: IRequest,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const userId = req.user.sub;
    return this.tasksService.updateTask(+userId, taskId, dto);
  }

  @Delete(':taskId')
  removeTask(@Req() req: IRequest, @Param('taskId') taskId: string) {
    const userId = req.user.sub;
    return this.tasksService.deleteTask(+userId, taskId);
  }

  @Post(':taskId/pomodoros')
  incrementPomodoros(@Req() req: IRequest, @Param('taskId') taskId: string) {
    const userId = req.user.sub;
    return this.tasksService.incrementPomodoros(+userId, taskId);
  }
}
