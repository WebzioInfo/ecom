import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@ApiTags('Catalog - Attributes')
@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('categories:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a dynamic product attribute with preset values' })
  create(@Body() dto: CreateAttributeDto) {
    return this.attributesService.create(dto);
  }

  @Post(':id/values')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('categories:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new attribute value' })
  addValue(
    @Param('id') id: string,
    @Body('value') value: string,
    @Body('code') code?: string,
  ) {
    return this.attributesService.addValue(id, value, code);
  }

  @Get()
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get all dynamic attributes with values' })
  findAll() {
    return this.attributesService.findAll();
  }

  @Get(':id')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get attribute by ID' })
  findOne(@Param('id') id: string) {
    return this.attributesService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('categories:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete attribute' })
  remove(@Param('id') id: string) {
    return this.attributesService.remove(id);
  }
}
