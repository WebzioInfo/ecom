import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBillingRecordDto } from './dto/create-billing.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CatalogEventService } from '../products/events/catalog-event.service';
import * as crypto from 'crypto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private prisma: PrismaService,
    private subscriptionsService: SubscriptionsService,
    private eventService: CatalogEventService,
  ) {}

  private async generateInvoiceNumber(): Promise<string> {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `INV-${todayStr}-${rand}`;
  }

  async createBillingRecord(dto: CreateBillingRecordDto, userId?: string) {
    const store = await this.prisma.public.store.findUnique({ where: { id: dto.storeId } });
    if (!store) throw new NotFoundException(`Store #${dto.storeId} not found.`);

    const invoiceNumber = await this.generateInvoiceNumber();
    const discount = dto.discount || 0;
    const tax = dto.tax || 0;
    const finalAmount = Math.max(0, dto.amount - discount + tax);

    const now = new Date();
    const dueDate = new Date(now.getTime() + 14 * 86400000);

    const billingRecord = {
      id: `BIL-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
      invoiceNumber,
      storeId: store.id,
      subscriptionId: dto.subscriptionId || (store.subscription as any)?.id || 'N/A',
      planId: dto.planId,
      billingPeriod: dto.billingPeriod,
      amount: dto.amount,
      discount,
      tax,
      finalAmount,
      dueDate: dueDate.toISOString(),
      paidDate: null,
      status: 'PENDING',
      paymentMethod: dto.paymentMethod || 'MANUAL',
      referenceNumber: dto.referenceNumber || null,
      createdAt: now.toISOString(),
    };

    // Store billing record inside store.subscription billingHistory
    const currentSub = (store.subscription as any) || {};
    const existingRecords = currentSub.billingHistory || [];

    const updatedSub = {
      ...currentSub,
      billingHistory: [billingRecord, ...existingRecords],
    };

    await this.prisma.public.store.update({
      where: { id: store.id },
      data: { subscription: updatedSub as any },
    });

    this.eventService.emit('billing.generated' as any, {
      invoiceNumber,
      storeId: store.id,
      finalAmount,
    });

    return billingRecord;
  }

  async findAll() {
    const stores = await this.prisma.public.store.findMany({
      select: { id: true, name: true, slug: true, subscription: true },
    });

    const allBillingRecords: any[] = [];
    for (const store of stores) {
      const sub = (store.subscription as any) || {};
      const records = sub.billingHistory || [];
      for (const rec of records) {
        allBillingRecords.push({ ...rec, storeName: store.name, slug: store.slug });
      }
    }

    allBillingRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return allBillingRecords;
  }

  async findOne(id: string) {
    const allRecords = await this.findAll();
    const record = allRecords.find((r) => r.id === id || r.invoiceNumber === id);
    if (!record) throw new NotFoundException(`Billing Record / Invoice #${id} not found.`);
    return record;
  }

  async payBillingRecord(id: string, referenceNumber?: string, userId?: string) {
    const record = await this.findOne(id);
    if (record.status === 'PAID') {
      throw new BadRequestException(`Invoice '${record.invoiceNumber}' is already PAID.`);
    }

    const store = await this.prisma.public.store.findUnique({ where: { id: record.storeId } });
    if (!store) throw new NotFoundException(`Store #${record.storeId} not found.`);

    const currentSub = (store.subscription as any) || {};
    const records = (currentSub.billingHistory || []).map((r: any) => {
      if (r.id === id || r.invoiceNumber === id) {
        return {
          ...r,
          status: 'PAID',
          paidDate: new Date().toISOString(),
          referenceNumber: referenceNumber || r.referenceNumber,
        };
      }
      return r;
    });

    const updatedSub = {
      ...currentSub,
      status: 'ACTIVE',
      billingHistory: records,
    };

    await this.prisma.public.store.update({
      where: { id: store.id },
      data: {
        subscription: updatedSub as any,
        status: 'ACTIVE',
      },
    });

    this.eventService.emit('billing.paid' as any, {
      invoiceNumber: record.invoiceNumber,
      storeId: store.id,
      amount: record.finalAmount,
    });

    this.eventService.emit('subscription.activated' as any, { storeId: store.id });

    return { success: true, message: `Invoice '${record.invoiceNumber}' marked as PAID. Subscription activated.` };
  }

  async failBillingRecord(id: string, reason?: string, userId?: string) {
    const record = await this.findOne(id);

    const store = await this.prisma.public.store.findUnique({ where: { id: record.storeId } });
    if (!store) throw new NotFoundException(`Store #${record.storeId} not found.`);

    const currentSub = (store.subscription as any) || {};
    const records = (currentSub.billingHistory || []).map((r: any) => {
      if (r.id === id || r.invoiceNumber === id) {
        return {
          ...r,
          status: 'FAILED',
          failureReason: reason || 'Payment Overdue / Failed',
        };
      }
      return r;
    });

    const updatedSub = {
      ...currentSub,
      status: 'GRACE_PERIOD',
      billingHistory: records,
    };

    await this.prisma.public.store.update({
      where: { id: store.id },
      data: { subscription: updatedSub as any },
    });

    this.eventService.emit('billing.failed' as any, {
      invoiceNumber: record.invoiceNumber,
      storeId: store.id,
      reason,
    });

    return { success: true, message: `Invoice '${record.invoiceNumber}' marked as FAILED. Store in GRACE_PERIOD.` };
  }
}
