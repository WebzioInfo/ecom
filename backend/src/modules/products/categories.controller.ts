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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './categories/dto/create-category.dto';
import { UpdateCategoryDto } from './categories/dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Catalog - Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('categories:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category' })
  create(@Body() dto: CreateCategoryDto, @Req() req: any) {
    return this.categoriesService.create(dto, req.user?.userId);
  }

  @Get()
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get all categories (flat list)' })
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.categoriesService.findAll(includeInactive === 'true');
  }

  @Get('tree')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get category hierarchy tree' })
  findTree() {
    return this.categoriesService.findTree();
  }

  @Get('slug/:slug')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get category by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get category by ID' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('categories:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Req() req: any,
  ) {
    return this.categoriesService.update(id, dto, req.user?.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('categories:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete category' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.categoriesService.remove(id, req.user?.userId);
  }
}
