import { IsUUID } from 'class-validator';

export class PinMessageDto {
  @IsUUID()
  messageId: string;

  @IsUUID()
  sessionId: string;
}
