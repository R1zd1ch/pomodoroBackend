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
import { UpdateSessionDto } from './dto/update-session.dto';

@UseGuards(AtGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  createSession(@Req() req: IRequest, @Body() dto: CreateSessionDto) {
    console.log('createdSession');
    return this.sessionsService.createSession(+req.user.sub, dto);
  }

  @Post(':id/join')
  joinSession(
    @Req() req: IRequest,
    @Body() dto: JoinSessionDto,
    @Param('id') id: string,
  ) {
    console.log('joinSession');
    return this.sessionsService.joinSession(+req.user.sub, id, dto);
  }

  @Patch(':id/update')
  updateSession(
    @Req() req: IRequest,
    @Param('id') id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    console.log('updateSession');
    return this.sessionsService.updateSession(id, dto);
  }

  @Patch(':id/roundTimeLeft')
  updateRoundTimeLeft(
    @Req() req: IRequest,
    @Param('id') id: string,
    @Body('roundTimeLeft') roundTimeLeft: number,
  ) {
    console.log('updateRoundTimeLeft');
    return this.sessionsService.updateSoloSessionRoundTimeLeft(
      +req.user.sub,
      id,
      roundTimeLeft,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Req() req: IRequest,
    @Param('id') id: string,
    @Body('status') status: SessionStatus,
  ) {
    console.log('updateStatus');
    console.log(id, status);
    return this.sessionsService.updateSessionStatus(+req.user.sub, id, status);
  }

  @Get('active')
  getActiveSession(@Req() req: IRequest) {
    console.log('getActiveSession');
    return this.sessionsService.getActiveSession(+req.user.sub);
  }

  @Get('last')
  getLastSoloSession(@Req() req: IRequest) {
    console.log('getLastSoloSession');
    return this.sessionsService.getLastSoloSession(+req.user.sub);
  }

  @Get(':id')
  getSession(@Req() req: IRequest, @Param('id') id: string) {
    console.log('getSession');
    return this.sessionsService.getSession(+req.user.sub, id);
  }

  @Post(':id/participants/:userId')
  addParticipant(
    @Req() req: IRequest,
    @Param('id') sessionId: string,
    @Param('userId') userId: string,
  ) {
    console.log('addParticipant');
    return this.sessionsService.addParticipant(
      sessionId,
      +req.user.sub,
      +userId,
    );
  }
}
