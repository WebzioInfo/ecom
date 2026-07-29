import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Inventory - Stock Management')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('summary')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('inventory.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get stock summary & low stock alerts' })
  getStockSummary() {
    return this.inventoryService.getStockSummary();
  }

  @Get('movements')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('inventory.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get immutable stock movement ledger history' })
  getMovements(
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.inventoryService.getMovements(productId, warehouseId);
  }

  @Post('adjust')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('inventory.update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adjust stock balance (IN, OUT, ADJUSTMENT, DAMAGE)' })
  adjustStock(@Body() dto: AdjustStockDto, @Req() req: any) {
    return this.inventoryService.adjustStock(dto, req.user?.userId);
  }

  @Post('transfer')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('inventory.adjust')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transfer stock between warehouses' })
  transferStock(@Body() dto: TransferStockDto, @Req() req: any) {
    return this.inventoryService.transferStock(dto, req.user?.userId);
  }

  @Post('reserve')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('inventory.transfer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reserve stock for order checkout' })
  reserveStock(@Body() dto: ReserveStockDto) {
    return this.inventoryService.reserveStock(dto);
  }
}
