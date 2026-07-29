import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CatalogEventService } from '../products/events/catalog-event.service';

@Injectable()
export class TenantMonitoringService {
  private readonly logger = new Logger(TenantMonitoringService.name);

  constructor(
    private prisma: PrismaService,
    private eventService: CatalogEventService,
  ) {}

  private calculateHealthScore(store: any, usage: any, limits: any) {
    let score = 100;
    const sub = (store.subscription as any) || {};

    if (sub.status === 'SUSPENDED') score -= 30;
    if (sub.status === 'EXPIRED') score -= 40;
    if (sub.status === 'FAILED') score -= 50;

    const storageLimit = limits?.maxStorageMB || 1024;
    const apiLimit = limits?.maxApiRequestsPerMonth || 10000;

    if (store.storageUsedMB && (store.storageUsedMB / storageLimit) > 0.9) score -= 15;
    if (store.apiUsageCount && (store.apiUsageCount / apiLimit) > 0.9) score -= 15;

    score = Math.max(0, score);

    let rating = 'EXCELLENT';
    if (score < 50) rating = 'CRITICAL';
    else if (score < 75) rating = 'WARNING';
    else if (score < 90) rating = 'GOOD';

    return { score, rating };
  }

  async getMonitoredStores(query: any = {}) {
    const stores = await this.prisma.public.store.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true } },
        apiKeys: { select: { id: true, name: true, key: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const plans = await this.prisma.public.plan.findMany();
    const planMap = new Map(plans.map((p) => [p.code, p]));

    const monitoredStores = [];

    for (const store of stores) {
      const sub = (store.subscription as any) || {};
      const planCode = sub.planCode || 'starter';
      const plan = planMap.get(planCode);
      const limits = (plan?.limits as any) || { maxProducts: 100, maxOrders: 500, maxStorageMB: 1024, maxApiRequestsPerMonth: 10000 };

      const schemaName = `tenant_${store.slug}`;
      const tenantPrisma = this.prisma.getTenantClient(schemaName);

      let productCount = 0;
      let orderCount = 0;
      let customerCount = 0;

      try {
        [productCount, orderCount, customerCount] = await Promise.all([
          tenantPrisma.product.count({ where: { isDeleted: false } }),
          tenantPrisma.order.count(),
          tenantPrisma.customer.count({ where: { isDeleted: false } }),
        ]);
      } catch {}

      const usage = {
        products: productCount,
        orders: orderCount,
        customers: customerCount,
        storageUsedMB: store.storageUsedMB || 0,
        apiCalls: store.apiUsageCount || 0,
      };

      const health = this.calculateHealthScore(store, usage, limits);

      monitoredStores.push({
        storeId: store.id,
        storeName: store.name,
        slug: store.slug,
        owner: store.owner,
        plan: planCode,
        subscriptionStatus: sub.status || 'TRIAL',
        storeStatus: store.status,
        createdDate: store.createdAt,
        usage,
        health,
      });
    }

    return monitoredStores;
  }

  async getMonitoredStoreById(id: string) {
    const stores = await this.getMonitoredStores();
    const store = stores.find((s) => s.storeId === id || s.slug === id);
    if (!store) throw new NotFoundException(`Monitored store #${id} not found.`);
    return store;
  }
}
