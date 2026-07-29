import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { ListBrandsDto } from './dto/list-brands.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@ApiTags('Catalog - Brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('brands:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new brand' })
  create(@Body() dto: CreateBrandDto, @Req() req: any) {
    return this.brandsService.create(dto, req.user?.userId);
  }

  @Get()
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get all brands with search and pagination' })
  findAll(@Query() query: ListBrandsDto) {
    return this.brandsService.findAll(query);
  }

  @Get('slug/:slug')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get brand details by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.brandsService.findBySlug(slug);
  }

  @Get(':id')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get brand details by ID' })
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('brands:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update brand details' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBrandDto,
    @Req() req: any,
  ) {
    return this.brandsService.update(id, dto, req.user?.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('brands:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a brand' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.brandsService.remove(id, req.user?.userId);
  }
}
