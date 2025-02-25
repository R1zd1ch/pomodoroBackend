import { CategoryColor } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(CategoryColor)
  color?: CategoryColor;

  @IsOptional()
  @IsString()
  icon?: string;
}
