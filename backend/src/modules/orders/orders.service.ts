import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CartService } from '../cart/cart.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Order, OrderStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private cartService: CartService,
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    let orderItems =
      createOrderDto.items?.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
      })) || [];

    if (!orderItems.length) {
      const cart = await this.cartService.getCart(userId);
      const items = cart.items as any[];
      orderItems = items.map((item) => {
        const product = item.product;
        if (typeof product === 'string') {
          return {
            product,
            quantity: item.quantity,
            priceAtPurchase: 0,
          };
        }
        return {
          product: product.id || product._id,
          quantity: item.quantity,
          priceAtPurchase: product.price ?? 0,
        };
      });
    }

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.quantity,
      0,
    );

    const savedOrder = await this.prisma.client.order.create({
      data: {
        userId,
        items: orderItems,
        totalAmount,
        status: OrderStatus.PENDING,
      }
    });

    await this.cartService.clearCart(userId);

    const phone =
      this.configService.get<string>('WHATSAPP_PHONE')?.replace(/\D/g, '') ||
      '15551234567';
    const message = encodeURIComponent(
      `Order ID: ${savedOrder.id}\nTotal: $${totalAmount.toFixed(2)}\nView: ${createOrderDto.returnUrl || ''}`,
    );

    return {
      order: savedOrder,
      whatsappUrl: `https://wa.me/${phone}?text=${message}`,
    };
  }

  async getOrders(userId: string, roles: string[]) {
    const where = roles.includes('admin') ? {} : { userId };
    
    const orders = await this.prisma.client.order.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    // In a real app we might want to fetch and populate product info for each item in the order
    
    return orders;
  }

  async getOrderById(userId: string, id: string, roles: string[]) {
    const order = await this.prisma.client.order.findUnique({
      where: { id }
    });

    if (!order) throw new NotFoundException('Order not found');

    if (!roles.includes('admin') && order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
}
