import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Order Management System (OMS)')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('super_admin', 'admin', 'company_admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Create an order' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get('store/:storeId')
  @Roles('super_admin', 'admin', 'company_admin', 'manager', 'staff')
  @ApiOperation({ summary: 'List orders for a specific store' })
  findByStore(
    @Param('storeId') storeId: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.ordersService.findByStore(storeId, { status, search, page: +page, limit: +limit });
  }

  @Get('store/:storeId/stats')
  @Roles('super_admin', 'admin', 'company_admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Get order statistics for a store' })
  getStoreOrderStats(@Param('storeId') storeId: string) {
    return this.ordersService.getStoreOrderStats(storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed order timeline by ID' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @Roles('super_admin', 'admin', 'company_admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Update order fulfillment status, tracking, or notes' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}
