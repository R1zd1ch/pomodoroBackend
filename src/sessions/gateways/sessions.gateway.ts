import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { SessionsService } from '../sessions.service';
import { Server, Socket } from 'socket.io';
import { SessionMemberStatus, SessionStatus } from '@prisma/client';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/sessions',
  cors: {
    origin: '*',
  },
})
export class SessionsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(SessionsGateway.name);

  constructor(private readonly sessionsService: SessionsService) {}
  handleConnection(client: Socket) {
    const userId = Number(client.handshake.query.userId);
    const sessionId = String(client.handshake.query.sessionId);

    if (userId && sessionId) {
      client.data = { userId, sessionId };
      this.logger.log(`User ${userId} connected to session ${sessionId}`);
    }
    console.log('Client connected:', client.id);
  }

  async handleDisconnect(client: Socket) {
    const { userId, sessionId } = client.data as {
      userId: number;
      sessionId: string;
    };

    if (userId && sessionId) {
      this.logger.log(`User ${userId} disconnected from session ${sessionId}`);
      await this.sessionsService.leaveSession(userId, sessionId);
      this.server.to(`session_${sessionId}`).emit('userLeft', { userId });
      console.log(`User ${userId} left session ${sessionId}`);
    }

    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('joinSession')
  async handleJoinSession(
    @MessageBody() data: { userId: number; sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const session = await this.sessionsService.joinSession(
      data.userId,
      data.sessionId,
      { initialStatus: SessionMemberStatus.READY },
    );
    console.log('joinedSession');

    this.server.to(`session_${data.sessionId}`).emit('userJoined', {
      userId: data.userId,
      session,
    });

    await client.join(`session_${data.sessionId}`);
    return session;
  }

  @SubscribeMessage('updateSessionStatus')
  async handleUpdateSessionStatus(
    @MessageBody()
    data: {
      userId: number;
      sessionId: string;
      newStatus: SessionStatus;
    },
  ) {
    const updatedSession = await this.sessionsService.updateSessionStatus(
      data.userId,
      data.sessionId,
      data.newStatus,
    );

    this.server
      .to(`session_${data.sessionId}`)
      .emit('sessionUpdated', updatedSession);

    return updatedSession;
  }
}
