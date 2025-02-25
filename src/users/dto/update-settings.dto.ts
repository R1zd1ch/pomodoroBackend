import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateSettingsDto {
  @IsInt()
  @Min(1)
  workDuration: number;

  @IsInt()
  @Min(1)
  shortBreakDuration: number;

  @IsInt()
  @Min(1)
  longBreakDuration: number;

  @IsInt()
  @Min(1)
  roundsBeforeLongBreak: number;

  @IsBoolean()
  autoStartPomodoros: boolean;

  @IsBoolean()
  @IsOptional()
  soundsEnabled?: boolean;
}
