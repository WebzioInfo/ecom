import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateWarehouseDto, AdjustStockDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Multi-Warehouse & Inventory')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('warehouses')
  @Roles('super_admin', 'admin', 'company_admin', 'manager')
  @ApiOperation({ summary: 'Create a new store warehouse' })
  createWarehouse(@Body() dto: CreateWarehouseDto) {
    return this.inventoryService.createWarehouse(dto);
  }

  @Get('warehouses/store/:storeId')
  @Roles('super_admin', 'admin', 'company_admin', 'manager', 'staff')
  @ApiOperation({ summary: 'List all warehouses for a store' })
  findWarehousesByStore(@Param('storeId') storeId: string) {
    return this.inventoryService.findWarehousesByStore(storeId);
  }

  @Post('stock/adjust')
  @Roles('super_admin', 'admin', 'company_admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Adjust stock levels for a product in a warehouse' })
  adjustStock(@Body() dto: AdjustStockDto) {
    return this.inventoryService.adjustStock(dto);
  }
}
