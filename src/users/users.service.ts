import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
        categories: true,
        tasks: true,
        friends: {
          include: {
            friend: true,
          },
          where: {
            status: 'ACCEPTED',
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async updateUserSettings(userId: number, dto: UpdateSettingsDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true },
    });

    if (!user?.settings) {
      return {
        ...dto,
        user: {
          connect: {
            id: userId,
          },
        },
      };
    }

    return this.prisma.userSettings.update({
      where: { id: user.settings.id },
      data: { ...dto },
    });
  }

  async updateUser(userId: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.newPassword && dto.oldPassword) {
      const passwordMatches = await argon2.verify(user.hash, dto.oldPassword);

      if (!passwordMatches) {
        throw new BadRequestException('Password does not match');
      }

      dto.newPassword = await argon2.hash(dto.newPassword);
    }

    if (dto.email && dto.email !== user.email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (emailTaken) {
        throw new BadRequestException('Email already taken');
      }
    }

    if (dto.username && dto.username !== user.username) {
      const usernameTaken = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });

      if (usernameTaken) {
        throw new BadRequestException('Username already taken');
      }
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
    });
  }

  async searchUsers(userId: number, query: string) {
    if (!query) {
      return [];
    }

    return (
      await this.prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
          ],
          NOT: { id: userId },
        },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
        },
      })
    ).filter((u) => u.id !== userId);
  }

  async createUser(dto: CreateUserDto) {
    const hash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        hash,

        settings: {
          create: {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            roundsBeforeLongBreak: 4,
            roundsPlanned: 4,
            autoStartPomodoros: true,
            soundEnabled: true,
            autoStartBreaks: true,
          },
        },
      },
      include: {
        settings: true,
      },
    });

    return user;
  }

  async getMySettings(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true },
    });

    if (!user?.settings) {
      const data = {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        roundsBeforeLongBreak: 4,
        autoStartPomodoros: true,
        soundEnabled: true,
        autoStartBreaks: true,
      };
      const settings = await this.prisma.userSettings.create({
        data: {
          ...data,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });

      return settings;
    }

    return user.settings;
  }

  async deleteUser(userId: number) {
    //TODO дополнить
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }
}
