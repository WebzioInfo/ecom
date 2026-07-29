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
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Orders - Shipments')
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('orders:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new shipment waybill' })
  create(@Body() dto: CreateShipmentDto, @Req() req: any) {
    return this.shipmentsService.create(dto, req.user?.userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('orders:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update shipment status & synchronize Order status' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateShipmentStatusDto,
    @Req() req: any,
  ) {
    return this.shipmentsService.updateStatus(id, dto, req.user?.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('orders:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all shipments' })
  findAll() {
    return this.shipmentsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('orders:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shipment details by ID' })
  findOne(@Param('id') id: string) {
    return this.shipmentsService.findOne(id);
  }
}
