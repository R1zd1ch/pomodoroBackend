import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { PinMessageDto } from '../dto/pin-message.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      userId: number;
      sessionId: string;
      dto: CreateMessageDto;
    },
  ) {
    const message = await this.chatService.sendMessage(
      data.userId,
      data.sessionId,
      data.dto,
    );
    this.logger.log('Message sent:', message);
    this.logger.log('Session ID:', `session_${data.sessionId}`);
    this.server.to(`session_${data.sessionId}`).emit('newMessage', message);

    return message;
  }

  @SubscribeMessage('editMessage')
  async handleEditMessage(
    @MessageBody()
    data: {
      userId: number;
      messageId: string;
      dto: UpdateMessageDto;
    },
  ) {
    const updatedMessage = await this.chatService.updateMessage(
      data.userId,
      data.messageId,
      data.dto,
    );

    this.server
      .to(`session_${updatedMessage.chat.sessionId}`)
      .emit('messageEdited', updatedMessage);
    return updatedMessage;
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @MessageBody() data: { userId: number; messageId: string },
  ) {
    const deletedMessage = await this.chatService.deleteMessage(
      data.userId,
      data.messageId,
    );

    this.server
      .to(`session_${deletedMessage.chat.sessionId}`)
      .emit('messageDeleted', { deletedMessage });

    return { message: 'Message deleted' };
  }

  @SubscribeMessage('pinMessage')
  async handlePinMessage(
    @MessageBody() data: { userId: number; dto: PinMessageDto },
  ) {
    const pinnedMessage = await this.chatService.pinMessage(
      data.userId,
      data.dto,
    );

    this.server
      .to(`session_${data.dto.sessionId}`)
      .emit('messagePinned', pinnedMessage);

    return { message: 'Message pinned' };
  }

  @SubscribeMessage('unpinMessage')
  async handleUnpinMessage(
    @MessageBody() data: { userId: number; dto: PinMessageDto },
  ) {
    const unpinnedMessage = await this.chatService.unpinMessage(
      data.userId,
      data.dto,
    );

    this.server
      .to(`session_${data.dto.sessionId}`)
      .emit('messageUnpinned', unpinnedMessage);
    return { message: 'Message unpinned' };
  }
}
