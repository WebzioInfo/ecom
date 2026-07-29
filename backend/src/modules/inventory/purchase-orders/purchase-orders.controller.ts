import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-po.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-po.dto';
import { PurchaseOrderStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@ApiTags('Inventory - Purchase Orders')
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly poService: PurchaseOrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('purchase-orders:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new Purchase Order in DRAFT status' })
  create(@Body() dto: CreatePurchaseOrderDto, @Req() req: any) {
    return this.poService.create(dto, req.user?.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('purchase-orders:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all Purchase Orders' })
  findAll() {
    return this.poService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('purchase-orders:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Purchase Order details by ID' })
  findOne(@Param('id') id: string) {
    return this.poService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('purchase-orders:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Purchase Order status (ORDERED, CANCELLED)' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: PurchaseOrderStatus,
    @Req() req: any,
  ) {
    return this.poService.updateStatus(id, status, req.user?.userId);
  }

  @Post(':id/receive')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('purchase-orders:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Receive inventory items on PO (Increments stock & logs movement)' })
  receiveGoods(
    @Param('id') id: string,
    @Body() dto: ReceivePurchaseOrderDto,
    @Req() req: any,
  ) {
    return this.poService.receiveGoods(id, dto, req.user?.userId);
  }
}
