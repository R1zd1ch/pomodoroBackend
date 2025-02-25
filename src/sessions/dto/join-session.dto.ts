import { SessionMemberStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class JoinSessionDto {
  @IsEnum(SessionMemberStatus)
  initialStatus: SessionMemberStatus = SessionMemberStatus.READY;
}
