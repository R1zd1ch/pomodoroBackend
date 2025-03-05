import { SessionStatus, SessionType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateSessionDto {
  @IsInt()
  @Min(1)
  workDuration: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  shortBreakDuration: number = 5;

  @IsInt()
  @Min(1)
  longBreakDuration: number = 15;

  @IsInt()
  @Min(1)
  roundsBeforeLongBreak: number = 4;

  @IsInt()
  @Min(1)
  @IsOptional()
  roundsPlanned?: number = 4;

  @IsInt()
  @Min(15 * 60)
  @IsOptional()
  roundTimeLeft?: number = 15 * 60;

  @IsEnum(SessionType)
  @IsOptional()
  type?: SessionType = 'GROUP';

  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus = 'PAUSED';

  @IsOptional()
  startTime?: Date;

  @IsOptional()
  endTime?: Date;
}
