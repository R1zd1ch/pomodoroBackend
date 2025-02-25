import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AtGuard, IRequest } from 'src/common/guards';
import { CreateCategoryDto } from './dto/create-category.dto';

@UseGuards(AtGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Req() req: IRequest, @Body() dto: CreateCategoryDto) {
    const userId = req.user.sub;
    return this.categoriesService.createCategory(+userId, dto);
  }

  @Get()
  findAll(@Req() req: IRequest) {
    const userId = req.user.sub;
    return this.categoriesService.getAllUserCategories(+userId);
  }

  @Get(':id')
  findOne(@Req() req: IRequest, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.categoriesService.getCategoryById(+userId, id);
  }

  @Get(':id/stats')
  getStats(@Req() req: IRequest, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.categoriesService.getCategoryStats(+userId, id);
  }

  @Patch(':id')
  update(
    @Req() req: IRequest,
    @Param('id') id: string,
    @Body() dto: CreateCategoryDto,
  ) {
    const userId = req.user.sub;
    return this.categoriesService.updateCategory(+userId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: IRequest, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.categoriesService.deleteCategory(+userId, id);
  }
}
