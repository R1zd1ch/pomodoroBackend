import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { JoinSessionDto } from './dto/join-session.dto';
import {
  NotificationType,
  SessionMemberStatus,
  SessionStatus,
} from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createSession(userId: number, dto: CreateSessionDto) {
    const session = await this.prisma.session.create({
      data: {
        ...dto,
        creatorId: userId,
        startTime: new Date(),
        participants: {
          create: { userId },
        },
      },
    });

    if (dto.type !== 'SOLO') {
      await this.prisma.chat.create({
        data: {
          sessionId: session.id,
        },
      });
    }
    const result = await this.getSessionResponse(session.id);
    console.log(result);
    return result;
  }

  async addParticipant(sessionId: string, inviterId: number, userId: number) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.type === 'SOLO') {
      throw new ForbiddenException(
        'You cannot add participants to a solo session',
      );
    }

    if (session.creatorId !== inviterId) {
      throw new ForbiddenException('Only session creator can add participants');
    }

    const participant = await this.prisma.sessionMember.upsert({
      where: { sessionId_userId: { sessionId, userId } },
      update: {},
      create: {
        sessionId,
        userId,
        currentStatus: SessionMemberStatus.READY,
      },
    });

    this.eventEmitter.emit('notification.create', {
      userId: userId,
      dto: {
        type: NotificationType.SESSION_INVITE,
        //Todo: add session name
        message: `You have been invited to a session `,
        payload: { sessionId, inviterId, startTime: session.startTime },
      },
    });

    return participant;
  }

  async joinSession(userId: number, sessionId: string, dto: JoinSessionDto) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status === 'COMPLETED') {
      throw new ForbiddenException('Session already completed');
    }

    return await this.prisma.sessionMember.upsert({
      where: { sessionId_userId: { sessionId, userId } },
      update: { currentStatus: dto.initialStatus },
      create: {
        sessionId,
        userId,
        currentStatus: dto.initialStatus,
      },
      include: { session: true },
    });
  }

  async leaveSession(userId: number, sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { participants: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.sessionMember.update({
      where: { sessionId_userId: { sessionId, userId: userId } },
      data: { currentStatus: SessionMemberStatus.LEFT },
    });

    const remainingMembers = await this.prisma.sessionMember.count({
      where: { sessionId },
    });

    if (remainingMembers === 0) {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { status: SessionStatus.COMPLETED, endTime: new Date() },
      });
    }

    return { message: 'User left session successfully' };
  }

  async updateSoloSessionRoundTimeLeft(
    userId: number,
    sessionId: string,
    roundTimeLeft: number,
  ) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId, creatorId: userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }
    const dataToUpdate: {
      roundTimeLeft?: number;
      currentRound?: number;
      status?: SessionStatus;
    } = {
      roundTimeLeft,
      currentRound: session.currentRound,
      status: session.status,
    };

    return await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        ...dataToUpdate,
      },
    });
  }

  async updateSession(sessionId: string, dto: UpdateSessionDto) {
    return await this.prisma.session.update({
      where: { id: sessionId },
      data: dto,
    });
  }

  async updateSessionStatus(
    userId: number,
    sessionId: string,
    newStatus: SessionStatus,
  ) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { participants: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.creatorId !== userId) {
      throw new ForbiddenException('Only session creator can update status');
    }

    const updateData: {
      status: SessionStatus;
      endTime?: Date;
      currentRound?: number;
    } = {
      status: newStatus,
      currentRound: session.currentRound,
    };

    if (newStatus === 'COMPLETED') {
      updateData.endTime = new Date();
    }

    if (session.status === 'BREAK') {
      updateData.currentRound = session.currentRound + 1;
    }

    return await this.prisma.session.update({
      where: { id: sessionId },
      data: updateData,
      include: { participants: true },
    });
  }

  async getActiveSession(userId: number) {
    return await this.prisma.session.findMany({
      where: {
        OR: [{ creatorId: userId }, { participants: { some: { userId } } }],
        status: { not: 'COMPLETED' },
        type: 'GROUP',
      },
      include: {
        participants: true,
        chat: true,
      },
    });
  }

  async getLastSoloSession(userId: number) {
    return await this.prisma.session.findFirst({
      where: {
        creatorId: userId,
        type: 'SOLO',
        OR: [{ status: 'BREAK' }, { status: 'WORK' }, { status: 'PAUSED' }],
        NOT: { status: 'COMPLETED' },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async getSession(userId: number, sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId, participants: { some: { userId } } },
      include: {
        participants: {
          include: { user: true },
        },
        chat: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  private async getSessionResponse(sessionId: string) {
    return this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        participants: {
          include: { user: true },
        },
        chat: true,
      },
    });
  }
}
