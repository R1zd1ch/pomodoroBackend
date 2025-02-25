import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PinMessageDto } from './dto/pin-message.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async sendMessage(userId: number, sessionId: string, dto: CreateMessageDto) {
    const session = await this.prisma.sessionMember.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
    });

    if (!session) {
      throw new ForbiddenException('User not in session');
    }

    const chat = await this.prisma.chat.findUnique({
      where: {
        sessionId,
      },
    });

    if (!chat) {
      return new NotFoundException('Chat not found');
    }

    return this.prisma.chatMessage.create({
      data: {
        ...dto,
        chatId: chat.id,
        userId,
      },
      include: { user: true },
    });
  }

  async getMessages(sessionId: string, page: number = 1, limit: number = 50) {
    const chat = await this.prisma.chat.findUnique({
      where: {
        sessionId,
      },
    });

    if (!chat) {
      return new NotFoundException('Chat not found');
    }

    return this.prisma.chatMessage.findMany({
      where: { chatId: chat.id },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async updateMessage(
    userId: number,
    messageId: string,
    dto: UpdateMessageDto,
  ) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.userId !== userId) {
      throw new ForbiddenException('You are not the author of this message');
    }

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { ...dto, isEdited: true, editedAt: new Date() },
      include: {
        user: true,
        chat: { select: { sessionId: true } },
      },
    });
  }

  async getPinnedMessages(sessionId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { sessionId },
    });

    if (!chat) return new NotFoundException('Chat not found');

    const pinned = await this.prisma.pinnedMessage.findMany({
      where: { chatId: chat.id },
    });

    return this.prisma.chatMessage.findMany({
      where: { id: { in: pinned.map((m) => m.messageId) } },
      include: { user: true },
    });
  }

  async pinMessage(userId: number, dto: PinMessageDto) {
    const [chat, message] = await this.prisma.$transaction([
      this.prisma.chat.findUnique({
        where: { id: dto.sessionId },
      }),
      this.prisma.chatMessage.findUnique({
        where: { id: dto.messageId },
      }),
    ]);

    if (!chat || !message) throw new NotFoundException('Message not found');
    if (message.userId !== userId)
      throw new ForbiddenException('You are not the author of this message');

    return this.prisma.pinnedMessage.upsert({
      where: { messageId: dto.messageId },
      create: {
        messageId: dto.messageId,
        chatId: chat.id,
      },
      update: {},
    });
  }

  async unpinMessage(userId: number, dto: PinMessageDto) {
    const [chat, message] = await this.prisma.$transaction([
      this.prisma.chat.findUnique({
        where: { id: dto.sessionId },
      }),
      this.prisma.chatMessage.findUnique({
        where: { id: dto.messageId },
      }),
    ]);

    if (!chat || !message) throw new NotFoundException('Message not found');
    if (message.userId !== userId)
      throw new ForbiddenException('You are not the author of this message');

    return this.prisma.pinnedMessage.delete({
      where: { messageId: dto.messageId },
    });
  }

  async deleteMessage(userId: number, messageId: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) throw new NotFoundException('Message not found');
    if (message.userId !== userId) {
      throw new ForbiddenException('You are not the author of this message');
    }

    return this.prisma.chatMessage.delete({
      where: { id: messageId },
      include: { chat: { select: { sessionId: true } } },
    });
  }
}
