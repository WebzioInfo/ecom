import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CashOnDeliveryStrategy } from './strategies/cod.strategy';
import { ManualPaymentStrategy } from './strategies/manual-payment.strategy';
import { CatalogEventService } from '../products/events/catalog-event.service';
import { PaymentStatus, OrderStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private codStrategy: CashOnDeliveryStrategy,
    private manualStrategy: ManualPaymentStrategy,
    private eventService: CatalogEventService,
  ) {}

  async create(dto: CreatePaymentDto, userId?: string) {
    const order = await this.prisma.tenant.order.findUnique({
      where: { id: dto.orderId },
    });
    if (!order) {
      throw new NotFoundException(`Order #${dto.orderId} not found.`);
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(`Cannot create payment for CANCELLED order '${order.orderNumber}'.`);
    }

    const payment = await this.prisma.tenant.payment.create({
      data: {
        orderId: dto.orderId,
        gateway: dto.gateway,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        transactionId: dto.transactionId || `TXN-${order.orderNumber.slice(-6)}-${Date.now()}`,
        status: 'PENDING',
      },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'PAYMENT_CREATE',
            entity: 'Payment',
            entityId: payment.id,
            changes: { gateway: payment.gateway, amount: payment.amount } as any,
          },
        });
      } catch {}
    }

    this.eventService.emit('payment.created' as any, {
      paymentId: payment.id,
      orderId: order.id,
      amount: payment.amount,
    });

    return payment;
  }

  async processPaymentSuccess(id: string, transactionId?: string, userId?: string) {
    const payment = await this.prisma.tenant.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: { items: true, customer: true, invoices: true, shipments: true },
        },
      },
    });

    if (!payment) throw new NotFoundException(`Payment #${id} not found.`);
    const order = payment.order;

    if (payment.status === 'PAID') {
      throw new BadRequestException('Payment is already marked as PAID.');
    }

    const txId = transactionId || payment.transactionId || `TXN-${Date.now()}`;

    // 1. Transactional Update: Update Payment & Order Status, Convert Stock Reservation to Deduction
    await this.prisma.tenant.$transaction(async (tx: any) => {
      // Update Payment Record
      await tx.payment.update({
        where: { id },
        data: { status: 'PAID', transactionId: txId },
      });

      // Update Order Status
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          status: OrderStatus.CONFIRMED,
        },
      });

      // Deduct Inventory Stock permanently from reservation
      for (const item of order.items) {
        const invItem = await tx.inventoryItem.findFirst({
          where: { productId: item.productId, variantId: item.variantId || null },
        });

        if (invItem) {
          await tx.inventoryItem.update({
            where: { id: invItem.id },
            data: {
              reservedQuantity: Math.max(0, invItem.reservedQuantity - item.quantity),
              quantity: Math.max(0, invItem.quantity - item.quantity),
            },
          });
        }

        // Deduct from overall product / variant
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
          if (variant) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: Math.max(0, variant.stock - item.quantity) },
            });
          }
        } else {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: Math.max(0, product.stock - item.quantity) },
            });
          }
        }
      }

      // Auto-generate Invoice if not already created
      if (order.invoices.length === 0) {
        const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const invCount = await tx.invoice.count();
        const invoiceNumber = `INV-${todayStr}-${(invCount + 1).toString().padStart(6, '0')}`;

        await tx.invoice.create({
          data: {
            invoiceNumber,
            orderId: order.id,
            amount: order.totalAmount,
            taxAmount: order.taxAmount,
            status: 'PAID',
            paidAt: new Date(),
          },
        });
      }

      // Auto-create Shipment if not already created
      if (order.shipments.length === 0) {
        const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const shpCount = await tx.shipment.count();
        const trackingNumber = `TRK-${todayStr}-${(shpCount + 1).toString().padStart(6, '0')}`;

        await tx.shipment.create({
          data: {
            orderId: order.id,
            shipmentNumber: trackingNumber,
            trackingNumber,
            courier: 'Standard Shipping',
            status: 'LABEL_CREATED',
          },
        });
      }
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'PAYMENT_SUCCESS',
            entity: 'Payment',
            entityId: id,
            changes: { status: 'PAID', transactionId: txId } as any,
          },
        });
      } catch {}
    }

    // Emit Domain Events
    this.eventService.emit('payment.paid' as any, { paymentId: id, orderId: order.id, transactionId: txId });
    this.eventService.emit('invoice.generated' as any, { orderId: order.id });
    this.eventService.emit('shipment.created' as any, { orderId: order.id });

    return this.findOne(id);
  }

  async processPaymentFailure(id: string, reason?: string, userId?: string) {
    const payment = await this.prisma.tenant.payment.findUnique({
      where: { id },
      include: { order: { include: { items: true } } },
    });

    if (!payment) throw new NotFoundException(`Payment #${id} not found.`);
    const order = payment.order;

    await this.prisma.tenant.$transaction(async (tx: any) => {
      // Update Payment Status
      await tx.payment.update({
        where: { id },
        data: { status: 'FAILED', rawDetails: { reason: reason || 'Payment declined' } },
      });

      // Update Order Status
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: PaymentStatus.FAILED },
      });

      // Release Reserved Stock
      for (const item of order.items) {
        const invItem = await tx.inventoryItem.findFirst({
          where: { productId: item.productId, variantId: item.variantId || null },
        });

        if (invItem) {
          await tx.inventoryItem.update({
            where: { id: invItem.id },
            data: { reservedQuantity: Math.max(0, invItem.reservedQuantity - item.quantity) },
          });
        }
      }
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'PAYMENT_FAILURE',
            entity: 'Payment',
            entityId: id,
            changes: { status: 'FAILED', reason } as any,
          },
        });
      } catch {}
    }

    this.eventService.emit('payment.failed' as any, { paymentId: id, orderId: order.id, reason });
    this.eventService.emit('inventory.released' as any, { orderId: order.id });

    return this.findOne(id);
  }

  async refundPayment(id: string, userId?: string) {
    const payment = await this.prisma.tenant.payment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!payment) throw new NotFoundException(`Payment #${id} not found.`);
    if (payment.status !== 'PAID') {
      throw new BadRequestException(`Cannot refund unpaid payment #${id} (Current status: ${payment.status}).`);
    }

    await this.prisma.tenant.$transaction(async (tx: any) => {
      await tx.payment.update({
        where: { id },
        data: { status: 'REFUNDED' },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: PaymentStatus.REFUNDED, status: OrderStatus.REFUNDED },
      });
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'PAYMENT_REFUND',
            entity: 'Payment',
            entityId: id,
            changes: { status: 'REFUNDED' } as any,
          },
        });
      } catch {}
    }

    this.eventService.emit('payment.refunded' as any, { paymentId: id, orderId: payment.orderId });

    return this.findOne(id);
  }

  async findAll() {
    return this.prisma.tenant.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { order: { select: { id: true, orderNumber: true, totalAmount: true } } },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.tenant.payment.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!payment) throw new NotFoundException(`Payment #${id} not found.`);
    return payment;
  }
}
