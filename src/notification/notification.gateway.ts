import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/notification',
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private userSockets = new Map<number, Socket>();

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.eventEmitter.on(
      'notification.sent',
      (data: { userId: string; notification: any }) => {
        this.sendToUser(+data.userId, 'notification.sent', data.notification);
      },
    );
  }

  handleConnection(client: Socket) {
    const userId = Number(client.handshake.query.userId);
    this.userSockets.set(userId, client);
  }

  handleDisconnect(client: Socket) {
    const userId = Number(client.handshake.query.userId);
    this.userSockets.delete(userId);
  }

  private sendToUser(userId: number, event: string, data: any) {
    const socket = this.userSockets.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }
}
