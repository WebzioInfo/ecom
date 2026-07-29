import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { ListOrdersDto } from './dto/list-orders.dto';
import { OrderStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Orders - Management')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('orders.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get orders with search, customer, status, and date range filters' })
  findAll(@Query() query: ListOrdersDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('orders.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order details by ID' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('orders.update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status enforcing strict state machine transitions' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @Req() req: any,
  ) {
    return this.ordersService.updateStatus(id, status, req.user?.userId);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('orders.cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel order and release reserved inventory' })
  cancelOrder(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.cancelOrder(id, req.user?.userId);
  }

  @Post(':id/return')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard)
  @Permissions('orders.return')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request order return' })
  returnOrder(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.returnOrder(id, req.user?.userId);
  }
}
