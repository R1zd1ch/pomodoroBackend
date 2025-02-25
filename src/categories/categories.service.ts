import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async createCategory(userId: number, dto: CreateCategoryDto) {
    const count = await this.prisma.category.count({
      where: { userId },
    });

    if (count >= 10) {
      throw new ForbiddenException('Maximum 10 categories allowed');
    }

    return await this.prisma.category.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async getAllUserCategories(userId: number) {
    return await this.prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCategoryById(userId: number, categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: { tasks: true },
    });

    if (!category || category.userId !== userId) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async updateCategory(
    userId: number,
    categoryId: string,
    dto: UpdateCategoryDto,
  ) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.userId !== userId) {
      throw new NotFoundException('Category not found');
    }

    return await this.prisma.category.update({
      where: { id: categoryId },
      data: { ...dto },
    });
  }

  async deleteCategory(userId: number, categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.userId !== userId) {
      throw new NotFoundException('Category not found');
    }

    const hasTasks = await this.prisma.task.count({
      where: { categoryId },
    });

    if (hasTasks > 0) {
      throw new ForbiddenException(
        'Cannot delete category with existing tasks',
      );
    }

    return await this.prisma.category.delete({
      where: { id: categoryId },
    });
  }

  async getCategoryStats(userId: number, categoryId: string) {
    const category = await this.getCategoryById(userId, categoryId);

    const tasksCount = await this.prisma.task.count({
      where: { categoryId },
    });

    const completedTasks = await this.prisma.task.count({
      where: {
        categoryId,
        status: 'COMPLETED',
      },
    });

    return {
      totalTasks: tasksCount,
      category: category,
      completedTasks,
      completionPercentage:
        tasksCount > 0 ? Math.round((completedTasks / tasksCount) * 100) : 0,
    };
  }
}
