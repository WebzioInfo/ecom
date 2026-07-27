import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest {
  user: {
    userId: string;
    roles: string[];
  };
}

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(
    @Request() req: AuthRequest,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(req.user.userId, createOrderDto);
  }

  @Get()
  async getOrders(@Request() req: AuthRequest, @Query() query: any) {
    return this.ordersService.getOrders(req.user.userId, req.user.roles || [], query);
  }

  @Get(':id')
  async getOrder(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.ordersService.getOrderById(req.user.userId, id, req.user.roles || []);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: any) {
    return this.ordersService.updateOrderStatus(id, body);
  }

  @Post(':id/fulfill')
  async fulfill(@Param('id') id: string, @Body() body: any) {
    return this.ordersService.fulfillOrder(id, body);
  }

  @Post(':id/refund')
  async refund(@Param('id') id: string, @Body() body: any) {
    return this.ordersService.refundOrder(id, body);
  }

  @Get(':id/invoice')
  async getInvoice(@Param('id') id: string) {
    return this.ordersService.generateInvoiceData(id);
  }
}
