import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CatalogEventService } from '../products/events/catalog-event.service';
import { InvoiceStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    private prisma: PrismaService,
    private eventService: CatalogEventService,
  ) {}

  private async generateInvoiceNumber(): Promise<string> {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.tenant.invoice.count();
    return `INV-${todayStr}-${(count + 1).toString().padStart(6, '0')}`;
  }

  async generateInvoice(orderId: string, userId?: string) {
    const order = await this.prisma.tenant.order.findUnique({
      where: { id: orderId },
      include: { invoices: true, customer: true, items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found.`);
    }

    if (order.invoices.length > 0) {
      throw new ConflictException(`Invoice already exists for Order '${order.orderNumber}'.`);
    }

    const invoiceNumber = await this.generateInvoiceNumber();
    const isPaid = order.paymentStatus === PaymentStatus.PAID;

    const invoice = await this.prisma.tenant.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        amount: order.totalAmount,
        taxAmount: order.taxAmount,
        status: isPaid ? InvoiceStatus.PAID : InvoiceStatus.ISSUED,
        paidAt: isPaid ? new Date() : null,
      },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'INVOICE_GENERATE',
            entity: 'Invoice',
            entityId: invoice.id,
            changes: { invoiceNumber, amount: invoice.amount } as any,
          },
        });
      } catch {}
    }

    this.eventService.emit('invoice.generated' as any, {
      invoiceId: invoice.id,
      orderId: order.id,
      invoiceNumber,
    });

    return invoice;
  }

  async findAll() {
    return this.prisma.tenant.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: { order: { select: { id: true, orderNumber: true, totalAmount: true } } },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.tenant.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: true,
            items: true,
            payments: true,
          },
        },
      },
    });

    if (!invoice) throw new NotFoundException(`Invoice #${id} not found.`);
    return invoice;
  }
}
