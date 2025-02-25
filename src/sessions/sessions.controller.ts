import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { AtGuard, IRequest } from 'src/common/guards';
import { CreateSessionDto } from './dto/create-session.dto';
import { JoinSessionDto } from './dto/join-session.dto';
import { SessionStatus } from '@prisma/client';

@UseGuards(AtGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  createSession(@Req() req: IRequest, @Body() dto: CreateSessionDto) {
    return this.sessionsService.createSession(+req.user.sub, dto);
  }

  @Post(':id/join')
  joinSession(
    @Req() req: IRequest,
    @Body() dto: JoinSessionDto,
    @Param('id') id: string,
  ) {
    return this.sessionsService.joinSession(+req.user.sub, id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Req() req: IRequest,
    @Param('id') id: string,
    @Body('status') status: SessionStatus,
  ) {
    return this.sessionsService.updateSessionStatus(+req.user.sub, id, status);
  }

  @Get('active')
  getActiveSession(@Req() req: IRequest) {
    return this.sessionsService.getActiveSession(+req.user.sub);
  }

  @Get(':id')
  getSession(@Req() req: IRequest, @Param('id') id: string) {
    return this.sessionsService.getSession(+req.user.sub, id);
  }

  @Post(':id/participants/:userId')
  addParticipant(
    @Req() req: IRequest,
    @Param('id') sessionId: string,
    @Param('userId') userId: string,
  ) {
    return this.sessionsService.addParticipant(
      sessionId,
      +req.user.sub,
      +userId,
    );
  }
}
