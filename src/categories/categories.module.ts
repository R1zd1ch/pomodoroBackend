import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { AtStrategy, RtStrategy } from 'src/auth/strategies';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, AtStrategy, RtStrategy],
})
export class CategoriesModule {}
