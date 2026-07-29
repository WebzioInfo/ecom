import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ListOrdersDto } from './dto/list-orders.dto';
import { CatalogEventService } from '../products/events/catalog-event.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  // Strict Order State Machine Transition Matrix
  private readonly allowedTransitions: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: ['REFUNDED'],
    CANCELLED: [],
    REFUNDED: [],
  };

  constructor(
    private prisma: PrismaService,
    private eventService: CatalogEventService,
  ) {}

  async findAll(query: ListOrdersDto) {
    const {
      search,
      status,
      paymentStatus,
      fulfillmentStatus,
      customerId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (fulfillmentStatus) where.fulfillmentStatus = fulfillmentStatus;
    if (customerId) where.customerId = customerId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.tenant.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          items: true,
          payments: { select: { id: true, gateway: true, status: true, amount: true } },
          shipments: { select: { id: true, trackingNumber: true, status: true } },
        },
      }),
      this.prisma.tenant.order.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.tenant.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: { select: { id: true, title: true, slug: true } },
            variant: { select: { id: true, title: true, sku: true } },
          },
        },
        payments: true,
        shipments: true,
        invoices: true,
      },
    });

    if (!order) throw new NotFoundException(`Order #${id} not found.`);
    return order;
  }

  async updateStatus(id: string, newStatus: OrderStatus, userId?: string) {
    const order = await this.findOne(id);
    const currentStatus = order.status;

    // Validate State Machine Transition
    const allowed = this.allowedTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid order status transition from '${currentStatus}' to '${newStatus}'.`,
      );
    }

    const updated = await this.prisma.tenant.order.update({
      where: { id },
      data: { status: newStatus },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'ORDER_STATUS_UPDATE',
            entity: 'Order',
            entityId: id,
            changes: { from: currentStatus, to: newStatus } as any,
          },
        });
      } catch {}
    }

    this.eventService.emit('order.updated' as any, {
      orderId: id,
      orderNumber: updated.orderNumber,
      status: newStatus,
    });

    if (newStatus === OrderStatus.DELIVERED) {
      this.eventService.emit('order.completed' as any, {
        orderId: id,
        orderNumber: updated.orderNumber,
      });
    }

    return updated;
  }

  async cancelOrder(id: string, userId?: string) {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(`Order '${order.orderNumber}' is already CANCELLED.`);
    }

    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException(`Order '${order.orderNumber}' cannot be cancelled as it is already ${order.status}.`);
    }

    const updated = await this.prisma.tenant.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });

    // Release Reserved Inventory
    for (const item of order.items) {
      const inventoryItem = await this.prisma.tenant.inventoryItem.findFirst({
        where: {
          productId: item.productId,
          variantId: item.variantId || null,
        },
      });

      if (inventoryItem) {
        await this.prisma.tenant.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { reservedQuantity: Math.max(0, inventoryItem.reservedQuantity - item.quantity) },
        });
      }
    }

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'ORDER_CANCEL',
            entity: 'Order',
            entityId: id,
            changes: { status: OrderStatus.CANCELLED } as any,
          },
        });
      } catch {}
    }

    this.eventService.emit('inventory.released' as any, {
      orderId: id,
      orderNumber: order.orderNumber,
    });

    this.eventService.emit('order.cancelled' as any, {
      orderId: id,
      orderNumber: order.orderNumber,
    });

    return updated;
  }

  async returnOrder(id: string, userId?: string) {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException(`Order '${order.orderNumber}' must be DELIVERED to request a return.`);
    }

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'ORDER_RETURN_REQUESTED',
            entity: 'Order',
            entityId: id,
            changes: { orderNumber: order.orderNumber } as any,
          },
        });
      } catch {}
    }

    this.eventService.emit('order.updated' as any, {
      orderId: id,
      orderNumber: order.orderNumber,
      action: 'RETURN_REQUESTED',
    });

    return { message: `Return request logged for Order '${order.orderNumber}'.` };
  }
}
