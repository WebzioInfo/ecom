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
          title: product.title,
          images: product.images,
          quantity: item.quantity,
          priceAtPurchase: product.price ?? 0,
        };
      });
    }

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.quantity,
      0,
    );

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    const savedOrder = await this.prisma.client.order.create({
      data: {
        orderNumber,
        userId,
        items: orderItems,
        totalAmount,
        taxAmount: Math.round(totalAmount * 0.1 * 100) / 100,
        status: OrderStatus.PENDING,
        paymentStatus: 'PAID',
        deliveryStatus: 'UNFULFILLED',
        timeline: [
          { status: 'ORDER_PLACED', timestamp: new Date().toISOString(), note: 'Order placed successfully' }
        ],
      }
    });

    await this.cartService.clearCart(userId);

    const phone =
      this.configService.get<string>('WHATSAPP_PHONE')?.replace(/\D/g, '') ||
      '15551234567';
    const message = encodeURIComponent(
      `Order ID: ${savedOrder.orderNumber || savedOrder.id}\nTotal: $${totalAmount.toFixed(2)}\nView: ${createOrderDto.returnUrl || ''}`,
    );

    return {
      order: savedOrder,
      whatsappUrl: `https://wa.me/${phone}?text=${message}`,
    };
  }

  async getOrders(userId: string, roles: string[], query: any = {}) {
    const isStoreAdmin = roles.some(r => ['admin', 'super_admin', 'store_admin', 'store_owner', 'STORE_ADMIN', 'STORE_OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(r));
    const where: any = isStoreAdmin ? {} : { userId };

    if (query.status) where.status = query.status;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.deliveryStatus) where.deliveryStatus = query.deliveryStatus;

    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { id: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Number(query.limit) || 20);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.client.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.client.order.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getOrderById(userId: string, id: string, roles: string[]) {
    const isStoreAdmin = roles.some(r => ['admin', 'super_admin', 'store_admin', 'store_owner', 'STORE_ADMIN', 'STORE_OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(r));
    const order = await this.prisma.client.order.findUnique({
      where: { id }
    });

    if (!order) throw new NotFoundException('Order not found');

    if (!isStoreAdmin && order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async updateOrderStatus(id: string, dto: { status?: OrderStatus; paymentStatus?: string; deliveryStatus?: string; note?: string }) {
    const order = await this.prisma.client.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    const timeline = Array.isArray(order.timeline) ? [...(order.timeline as any[])] : [];
    if (dto.status) {
      timeline.push({ status: dto.status, timestamp: new Date().toISOString(), note: dto.note || `Status updated to ${dto.status}` });
    }
    if (dto.deliveryStatus) {
      timeline.push({ status: dto.deliveryStatus, timestamp: new Date().toISOString(), note: `Delivery status updated to ${dto.deliveryStatus}` });
    }

    return this.prisma.client.order.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.paymentStatus && { paymentStatus: dto.paymentStatus }),
        ...(dto.deliveryStatus && { deliveryStatus: dto.deliveryStatus }),
        timeline,
      },
    });
  }

  async fulfillOrder(id: string, dto: { courier: string; trackingNumber: string; note?: string }) {
    const order = await this.prisma.client.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    const timeline = Array.isArray(order.timeline) ? [...(order.timeline as any[])] : [];
    timeline.push({
      status: 'SHIPPED',
      timestamp: new Date().toISOString(),
      note: `Fulfilled via ${dto.courier} (Tracking: ${dto.trackingNumber})`,
    });

    return this.prisma.client.order.update({
      where: { id },
      data: {
        status: OrderStatus.SHIPPED,
        deliveryStatus: 'SHIPPED',
        courier: dto.courier,
        trackingNumber: dto.trackingNumber,
        timeline,
      },
    });
  }

  async refundOrder(id: string, dto: { amount?: number; reason?: string }) {
    const order = await this.prisma.client.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    const timeline = Array.isArray(order.timeline) ? [...(order.timeline as any[])] : [];
    timeline.push({
      status: 'REFUNDED',
      timestamp: new Date().toISOString(),
      note: `Refunded $${dto.amount || order.totalAmount}. Reason: ${dto.reason || 'Customer request'}`,
    });

    return this.prisma.client.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
        paymentStatus: 'REFUNDED',
        timeline,
      },
    });
  }

  async generateInvoiceData(id: string) {
    const order = await this.prisma.client.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    return {
      invoiceNumber: `INV-${order.orderNumber || order.id.slice(0, 8)}`,
      issueDate: new Date(order.createdAt).toLocaleDateString(),
      order,
    };
  }
}
