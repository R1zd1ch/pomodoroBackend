import { SessionStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class CreateSessionDto {
  @IsInt()
  @Min(1)
  workDuration: number;

  @IsInt()
  @Min(1)
  breakDuration: number = 5;

  @IsInt()
  @Min(1)
  @IsOptional()
  roundsPlanned?: number = 4;

  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus = 'PAUSED';

  @IsOptional()
  startTime?: Date;

  @IsOptional()
  endTime?: Date;
}
