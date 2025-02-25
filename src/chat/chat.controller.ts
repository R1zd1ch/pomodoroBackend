import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AtGuard, IRequest } from 'src/common/guards';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PinMessageDto } from './dto/pin-message.dto';

@UseGuards(AtGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post(':sessionId')
  sendMessage(
    @Req() req: IRequest,
    @Param('sessionId') sessionId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.chatService.sendMessage(+req.user.sub, sessionId, dto);
  }

  @Get(':sessionId')
  getMessage(
    @Param('sessionId') sessionId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.chatService.getMessages(sessionId, page, limit);
  }
  @Get(':sessionId/pinned')
  getPinnedMessages(@Param('sessionId') sessionId: string) {
    return this.chatService.getPinnedMessages(sessionId);
  }

  @Patch(':messageId')
  updateMessage(
    @Req() req: IRequest,
    @Param('messageId') messageId: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.chatService.updateMessage(+req.user.sub, messageId, dto);
  }

  @Post(':messageId/pin')
  pinMessage(@Req() req: IRequest, @Body() dto: PinMessageDto) {
    return this.chatService.pinMessage(+req.user.sub, dto);
  }

  @Post(':messageId/unpin')
  unpinMessage(@Req() req: IRequest, @Body() dto: PinMessageDto) {
    return this.chatService.unpinMessage(+req.user.sub, dto);
  }

  @Delete(':messageId')
  deleteMessage(@Req() req: IRequest, @Param('messageId') messageId: string) {
    return this.chatService.deleteMessage(+req.user.sub, messageId);
  }
}
