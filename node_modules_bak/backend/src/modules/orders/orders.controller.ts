import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
  async getOrders(@Request() req: AuthRequest) {
    return this.ordersService.getOrders(req.user.userId, req.user.roles);
  }

  @Get(':id')
  async getOrder(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.ordersService.getOrderById(req.user.userId, id, req.user.roles);
  }
}
