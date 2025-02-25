import { ChatMessageType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsEnum(ChatMessageType)
  @IsOptional()
  type?: ChatMessageType = 'MESSAGE';

  @IsString()
  @IsOptional()
  attachment?: string;
}
