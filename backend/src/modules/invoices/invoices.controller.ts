import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Orders - Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('order/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('orders:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually generate invoice for an order' })
  generateInvoice(@Param('orderId') orderId: string, @Req() req: any) {
    return this.invoicesService.generateInvoice(orderId, req.user?.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('orders:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all invoices' })
  findAll() {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('orders:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invoice details by ID' })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }
}
