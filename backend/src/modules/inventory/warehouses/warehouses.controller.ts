import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@ApiTags('Inventory - Warehouses')
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('warehouse:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new warehouse' })
  create(@Body() dto: CreateWarehouseDto, @Req() req: any) {
    return this.warehousesService.create(dto, req.user?.userId);
  }

  @Get()
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get all warehouses' })
  findAll() {
    return this.warehousesService.findAll();
  }

  @Get(':id')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get warehouse details by ID' })
  findOne(@Param('id') id: string) {
    return this.warehousesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('warehouse:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update warehouse details' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseDto,
    @Req() req: any,
  ) {
    return this.warehousesService.update(id, dto, req.user?.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('warehouse:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete warehouse' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.warehousesService.remove(id, req.user?.userId);
  }
}
