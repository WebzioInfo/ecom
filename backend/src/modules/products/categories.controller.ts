import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get('dropdown')
  async getDropdown() {
    return this.categoriesService.getDropdown();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: any) {
    return this.categoriesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.categoriesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async replace(@Param('id') id: string, @Body() dto: any) {
    return this.categoriesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/permanent')
  async permanentDelete(@Param('id') id: string) {
    return this.categoriesService.permanentDelete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/restore')
  async restore(@Param('id') id: string) {
    return this.categoriesService.restore(id);
  }
}
