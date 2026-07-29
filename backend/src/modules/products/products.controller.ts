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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Catalog - Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get products with pagination, search, category, brand, and status filters' })
  findAll(@Query() query: ListProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get('slug/:slug')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get product details by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get product details by ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('products.create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product with variants and media gallery' })
  create(@Body() dto: CreateProductDto, @Req() req: any) {
    return this.productsService.create(dto, req.user?.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('products.update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product details' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: any,
  ) {
    return this.productsService.update(id, dto, req.user?.userId);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('products.publish')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish product (Validates at least 1 active variant exists)' })
  publish(@Param('id') id: string, @Req() req: any) {
    return this.productsService.publish(id, req.user?.userId);
  }

  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('products.update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive product' })
  archive(@Param('id') id: string, @Req() req: any) {
    return this.productsService.archive(id, req.user?.userId);
  }

  @Post('bulk-delete')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('products.delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk soft delete products' })
  bulkDelete(@Body('ids') ids: string[], @Req() req: any) {
    return this.productsService.bulkDelete(ids, req.user?.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('products.delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete product' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.productsService.remove(id, req.user?.userId);
  }
}
