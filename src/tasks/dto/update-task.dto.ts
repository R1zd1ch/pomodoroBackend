import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';
import { TaskStatus } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  completedPomodoros?: number;
}
