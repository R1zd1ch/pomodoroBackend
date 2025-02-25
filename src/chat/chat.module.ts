import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AtStrategy, RtStrategy } from 'src/auth/strategies';
import { ChatGateway } from './gateways/chat.gateway';

@Module({
  controllers: [ChatController],
  providers: [ChatService, AtStrategy, RtStrategy, ChatGateway],
})
export class ChatModule {}
