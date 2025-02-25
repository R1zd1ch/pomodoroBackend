import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { AtStrategy, RtStrategy } from 'src/auth/strategies';
import { SessionsGateway } from './gateways/sessions.gateway';

@Module({
  controllers: [SessionsController],
  providers: [SessionsService, AtStrategy, RtStrategy, SessionsGateway],
})
export class SessionsModule {}
