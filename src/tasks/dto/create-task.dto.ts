import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  estimatedPomodoros?: number;

  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
