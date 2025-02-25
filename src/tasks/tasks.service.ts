import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async createTask(userId: number, dto: CreateTaskDto) {
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category || category.userId !== userId) {
        throw new ForbiddenException('Invalid category');
      }
    }

    return this.prisma.task.create({
      data: {
        ...dto,
        userId,
        completedPomodoros: 0,
        status: 'ACTIVE',
      },
      include: { category: true },
    });
  }

  async getTaskById(userId: number, taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { category: true },
    });

    if (!task || task.userId !== userId) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async updateTask(userId: number, taskId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== userId) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: { ...dto },
      include: { category: true },
    });
  }

  async deleteTask(userId: number, taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== userId) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: { status: 'REMOVED' },
    });
  }

  async getAllUsersTasks(
    userId: number,
    status?: TaskStatus,
    categoryId?: string,
  ) {
    const where: { userId?: number; status?: TaskStatus; categoryId?: string } =
      { userId };
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;

    return this.prisma.task.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async incrementPomodoros(userId: number, taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== userId) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: { completedPomodoros: { increment: 1 } },
    });
  }
}
