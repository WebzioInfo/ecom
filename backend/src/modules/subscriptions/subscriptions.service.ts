import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubscriptionDto, BillingCycle } from './dto/create-subscription.dto';
import { RenewSubscriptionDto } from './dto/renew-subscription.dto';
import { UpgradeSubscriptionDto } from './dto/upgrade-subscription.dto';
import { CatalogEventService } from '../products/events/catalog-event.service';
import { StoreStatus } from '@prisma/public-client';
import * as crypto from 'crypto';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  // Subscription State Machine Transition Matrix
  private readonly allowedTransitions: Record<string, string[]> = {
    TRIAL: ['ACTIVE', 'RENEWAL_DUE', 'SUSPENDED', 'CANCELLED'],
    ACTIVE: ['RENEWAL_DUE', 'UPGRADING', 'DOWNGRADING', 'SUSPENDED', 'CANCELLED'],
    RENEWAL_DUE: ['ACTIVE', 'GRACE_PERIOD', 'SUSPENDED', 'CANCELLED'],
    GRACE_PERIOD: ['ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED'],
    SUSPENDED: ['ACTIVE', 'CANCELLED'],
    EXPIRED: ['ACTIVE', 'CANCELLED'],
    UPGRADING: ['ACTIVE', 'SUSPENDED'],
    DOWNGRADING: ['ACTIVE', 'SUSPENDED'],
    CANCELLED: [],
  };

  constructor(
    private prisma: PrismaService,
    private eventService: CatalogEventService,
  ) {}

  private calculatePeriodEnd(startDate: Date, cycle: BillingCycle = BillingCycle.MONTHLY): Date {
    const end = new Date(startDate.getTime());
    if (cycle === BillingCycle.YEARLY) {
      end.setFullYear(end.getFullYear() + 1);
    } else if (cycle === BillingCycle.HALF_YEARLY) {
      end.setMonth(end.getMonth() + 6);
    } else if (cycle === BillingCycle.QUARTERLY) {
      end.setMonth(end.getMonth() + 3);
    } else {
      end.setMonth(end.getMonth() + 1); // Default MONTHLY
    }
    return end;
  }

  async create(dto: CreateSubscriptionDto, userId?: string) {
    const store = await this.prisma.public.store.findUnique({
      where: { id: dto.storeId },
    });
    if (!store) throw new NotFoundException(`Store #${dto.storeId} not found.`);

    const plan = await this.prisma.public.plan.findFirst({
      where: { OR: [{ id: dto.planId }, { code: dto.planId }] },
    });
    if (!plan) throw new NotFoundException(`Plan '${dto.planId}' not found.`);

    const now = new Date();
    const isTrial = dto.startTrial ?? true;
    const trialDays = dto.trialDays || plan.trialDays || 14;
    const trialEndsAt = new Date(now.getTime() + trialDays * 86400000);
    const periodEnd = this.calculatePeriodEnd(now, dto.billingCycle);

    const subscriptionData = {
      id: `SUB-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
      storeId: store.id,
      planId: plan.id,
      planCode: plan.code,
      planName: plan.name,
      status: isTrial ? 'TRIAL' : 'ACTIVE',
      billingCycle: dto.billingCycle || BillingCycle.MONTHLY,
      trialStartsAt: now.toISOString(),
      trialEndsAt: trialEndsAt.toISOString(),
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      autoRenew: true,
      createdAt: now.toISOString(),
    };

    const updatedStore = await this.prisma.public.store.update({
      where: { id: store.id },
      data: {
        subscription: subscriptionData as any,
      },
    });

    this.eventService.emit('subscription.created' as any, {
      storeId: store.id,
      subscriptionId: subscriptionData.id,
      planCode: plan.code,
      status: subscriptionData.status,
    });

    return updatedStore.subscription;
  }

  async findAll() {
    const stores = await this.prisma.public.store.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        subscription: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return stores.map((s) => ({
      storeId: s.id,
      storeName: s.name,
      slug: s.slug,
      storeStatus: s.status,
      subscription: s.subscription,
    }));
  }

  async findOne(storeId: string) {
    const store = await this.prisma.public.store.findUnique({
      where: { id: storeId },
    });
    if (!store) throw new NotFoundException(`Store #${storeId} not found.`);

    const sub = (store.subscription as any) || {};
    if (!sub.id) throw new NotFoundException(`No subscription found for store #${storeId}.`);

    return {
      storeId: store.id,
      storeName: store.name,
      subscription: sub,
    };
  }

  async updateState(storeId: string, newStatus: string, userId?: string) {
    const store = await this.prisma.public.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException(`Store #${storeId} not found.`);

    const sub = (store.subscription as any) || {};
    const currentStatus = sub.status || 'TRIAL';

    const allowed = this.allowedTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid subscription transition from '${currentStatus}' to '${newStatus}'.`,
      );
    }

    const updatedSub = {
      ...sub,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    let storeStatus = store.status;
    if (newStatus === 'SUSPENDED') storeStatus = StoreStatus.SUSPENDED;
    if (newStatus === 'ACTIVE') storeStatus = StoreStatus.ACTIVE;

    await this.prisma.public.store.update({
      where: { id: storeId },
      data: {
        subscription: updatedSub as any,
        status: storeStatus,
      },
    });

    if (newStatus === 'SUSPENDED') {
      this.eventService.emit('subscription.suspended' as any, { storeId, subscriptionId: sub.id });
    } else if (newStatus === 'ACTIVE') {
      this.eventService.emit('subscription.activated' as any, { storeId, subscriptionId: sub.id });
    } else if (newStatus === 'EXPIRED') {
      this.eventService.emit('subscription.expired' as any, { storeId, subscriptionId: sub.id });
    }

    return updatedSub;
  }

  async renew(storeId: string, dto: RenewSubscriptionDto, userId?: string) {
    const store = await this.prisma.public.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException(`Store #${storeId} not found.`);

    const sub = (store.subscription as any) || {};
    if (sub.status === 'CANCELLED') {
      throw new BadRequestException('Cannot renew a CANCELLED subscription.');
    }

    const now = new Date();
    const cycle = dto.billingCycle || sub.billingCycle || BillingCycle.MONTHLY;
    const newPeriodEnd = this.calculatePeriodEnd(now, cycle);

    const renewedSub = {
      ...sub,
      status: 'ACTIVE',
      billingCycle: cycle,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: newPeriodEnd.toISOString(),
      lastRenewedAt: now.toISOString(),
    };

    await this.prisma.public.store.update({
      where: { id: storeId },
      data: {
        subscription: renewedSub as any,
        status: StoreStatus.ACTIVE,
      },
    });

    this.eventService.emit('subscription.renewed' as any, {
      storeId,
      subscriptionId: sub.id,
      newPeriodEnd: newPeriodEnd.toISOString(),
    });

    return renewedSub;
  }

  async upgrade(storeId: string, dto: UpgradeSubscriptionDto, userId?: string) {
    const store = await this.prisma.public.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException(`Store #${storeId} not found.`);

    const newPlan = await this.prisma.public.plan.findFirst({
      where: { OR: [{ id: dto.newPlanId }, { code: dto.newPlanId }] },
    });
    if (!newPlan) throw new NotFoundException(`Plan '${dto.newPlanId}' not found.`);

    const sub = (store.subscription as any) || {};
    const now = new Date();
    const cycle = dto.billingCycle || sub.billingCycle || BillingCycle.MONTHLY;
    const newPeriodEnd = this.calculatePeriodEnd(now, cycle);

    const upgradedSub = {
      ...sub,
      planId: newPlan.id,
      planCode: newPlan.code,
      planName: newPlan.name,
      status: 'ACTIVE',
      billingCycle: cycle,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: newPeriodEnd.toISOString(),
      lastUpgradedAt: now.toISOString(),
    };

    await this.prisma.public.store.update({
      where: { id: storeId },
      data: {
        subscription: upgradedSub as any,
        status: StoreStatus.ACTIVE,
      },
    });

    this.eventService.emit('subscription.upgraded' as any, {
      storeId,
      subscriptionId: sub.id,
      newPlanCode: newPlan.code,
    });

    return upgradedSub;
  }

  async downgrade(storeId: string, dto: UpgradeSubscriptionDto, userId?: string) {
    const store = await this.prisma.public.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException(`Store #${storeId} not found.`);

    const newPlan = await this.prisma.public.plan.findFirst({
      where: { OR: [{ id: dto.newPlanId }, { code: dto.newPlanId }] },
    });
    if (!newPlan) throw new NotFoundException(`Plan '${dto.newPlanId}' not found.`);

    const sub = (store.subscription as any) || {};

    const downgradedSub = {
      ...sub,
      status: 'DOWNGRADING',
      scheduledPlanId: newPlan.id,
      scheduledPlanCode: newPlan.code,
      effectiveAt: sub.currentPeriodEnd || new Date().toISOString(),
    };

    await this.prisma.public.store.update({
      where: { id: storeId },
      data: { subscription: downgradedSub as any },
    });

    this.eventService.emit('subscription.downgrade.scheduled' as any, {
      storeId,
      scheduledPlanCode: newPlan.code,
      effectiveAt: downgradedSub.effectiveAt,
    });

    return downgradedSub;
  }

  async getUsage(storeId: string) {
    const store = await this.prisma.public.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException(`Store #${storeId} not found.`);

    const sub = (store.subscription as any) || {};
    const planCode = sub.planCode || 'starter';

    const plan = await this.prisma.public.plan.findFirst({
      where: { OR: [{ code: planCode }, { id: sub.planId || 'starter' }] },
    });

    const limits = (plan?.limits as any) || {
      maxProducts: 100,
      maxOrders: 500,
      maxCustomers: 1000,
      maxWarehouses: 2,
      maxStaff: 5,
      maxStorageMB: 1024,
      maxApiRequestsPerMonth: 10000,
    };

    const schemaName = `tenant_${store.slug}`;
    const tenantPrisma = this.prisma.getTenantClient(schemaName);

    // Aggregate Real-time resource counts from tenant schema
    let productCount = 0;
    let orderCount = 0;
    let customerCount = 0;
    let warehouseCount = 0;

    try {
      [productCount, orderCount, customerCount, warehouseCount] = await Promise.all([
        tenantPrisma.product.count({ where: { isDeleted: false } }),
        tenantPrisma.order.count(),
        tenantPrisma.customer.count({ where: { isDeleted: false } }),
        tenantPrisma.warehouse.count({ where: { isActive: true } }),
      ]);
    } catch {}

    const usage = {
      products: productCount,
      orders: orderCount,
      customers: customerCount,
      warehouses: warehouseCount,
      apiCalls: store.apiUsageCount || 0,
      storageUsedMB: store.storageUsedMB || 0,
    };

    const quotaRemaining = {
      products: Math.max(0, (limits.maxProducts || 100) - productCount),
      orders: Math.max(0, (limits.maxOrders || 500) - orderCount),
      customers: Math.max(0, (limits.maxCustomers || 1000) - customerCount),
      warehouses: Math.max(0, (limits.maxWarehouses || 2) - warehouseCount),
      apiCalls: Math.max(0, (limits.maxApiRequestsPerMonth || 10000) - (store.apiUsageCount || 0)),
    };

    return {
      storeId,
      planName: plan?.name || planCode,
      usage,
      limits,
      quotaRemaining,
      features: plan?.features || {},
    };
  }
}
