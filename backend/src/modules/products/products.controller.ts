import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() query: ListProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get('filters')
  async getFilters() {
    return {
      categories: await this.productsService.getCategories(),
      brands: await this.productsService.getBrands(),
    };
  }

  @Get('featured')
  async getFeatured() {
    return this.productsService.findFeatured();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('bulk-update')
  async bulkUpdate(@Body() body: { ids: string[]; data: any }) {
    return this.productsService.bulkUpdate(body.ids, body.data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('bulk-delete')
  async bulkDelete(@Body() body: { ids: string[] }) {
    return this.productsService.bulkDelete(body.ids);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/restore')
  async restore(@Param('id') id: string) {
    return this.productsService.restore(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
