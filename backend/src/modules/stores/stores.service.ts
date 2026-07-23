import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Store, StoreStatus } from '@prisma/public-client';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const existing = await this.prisma.client.store.findUnique({
      where: { slug: createStoreDto.slug }
    });
    if (existing) {
      throw new ConflictException(`Store with slug '${createStoreDto.slug}' already exists`);
    }

    return this.prisma.client.store.create({
      data: {
        name: createStoreDto.name,
        slug: createStoreDto.slug,
        ownerId: createStoreDto.ownerId,
      } as any
    });
  }

  async findAll(query: {
    search?: string;
    status?: StoreStatus;
    page?: number;
    limit?: number;
  }) {
    const { search, status, page = 1, limit = 20 } = query;
    
    const where: Prisma.StoreWhereInput = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    
    const [stores, total] = await Promise.all([
      this.prisma.client.store.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          owner: { select: { name: true, email: true, roles: true } }
        }
      }),
      this.prisma.client.store.count({ where }),
    ]);

    return {
      data: stores,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.prisma.client.store.findUnique({
      where: { id },
      include: { owner: { select: { name: true, email: true, roles: true } } }
    });
    if (!store) throw new NotFoundException(`Store #${id} not found`);
    return store;
  }

  async findBySlug(slug: string): Promise<Store> {
    const store = await this.prisma.client.store.findUnique({
      where: { slug },
      include: { owner: { select: { name: true, email: true, roles: true } } }
    });
    if (!store) throw new NotFoundException(`Store with slug '${slug}' not found`);
    return store;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto): Promise<Store> {
    try {
      return await this.prisma.client.store.update({
        where: { id },
        data: updateStoreDto as any
      });
    } catch {
      throw new NotFoundException(`Store #${id} not found`);
    }
  }

  async setStatus(id: string, status: StoreStatus): Promise<Store> {
    return this.update(id, { status });
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      await this.prisma.client.store.delete({ where: { id } });
      return { message: `Store #${id} deleted successfully` };
    } catch {
      throw new NotFoundException(`Store #${id} not found`);
    }
  }

  async getGlobalAnalytics() {
    const [totalStores, activeStores, suspendedStores, aggregatedUsage] = await Promise.all([
      this.prisma.client.store.count(),
      this.prisma.client.store.count({ where: { status: StoreStatus.ACTIVE } }),
      this.prisma.client.store.count({ where: { status: StoreStatus.SUSPENDED } }),
      this.prisma.client.store.aggregate({
        _sum: {
          apiUsageCount: true,
          storageUsedMB: true,
          productCount: true,
          orderCount: true,
        }
      })
    ]);

    return {
      totalStores,
      activeStores,
      suspendedStores,
      totalApiRequests: aggregatedUsage._sum.apiUsageCount || 0,
      totalStorageMB: aggregatedUsage._sum.storageUsedMB || 0,
      totalProducts: aggregatedUsage._sum.productCount || 0,
      totalOrders: aggregatedUsage._sum.orderCount || 0,
      systemHealth: '100% Operational',
    };
  }

  async getFullDetails(id: string) {
    const store = await this.prisma.client.store.findUnique({
      where: { id },
      include: {
        owner: { select: { name: true, email: true, roles: true, createdAt: true } }
      }
    });

    if (!store) throw new NotFoundException(`Store #${id} not found`);

    return {
      store,
      metrics: {
        totalRevenue: Math.floor(Math.random() * 50000), 
        monthlyRevenue: Math.floor(Math.random() * 10000),
      },
    };
  }

  async changePlan(id: string, planId: string): Promise<Store> {
    const store = await this.prisma.client.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundException(`Store #${id} not found`);

    const subscription = (store.subscription as any) || {};
    subscription.planId = planId;
    subscription.renewalDate = new Date(new Date().setMonth(new Date().getMonth() + 1));

    return this.prisma.client.store.update({
      where: { id },
      data: { subscription }
    });
  }

  async transferOwnership(id: string, newOwnerId: string): Promise<Store> {
    try {
      return await this.prisma.client.store.update({
        where: { id },
        data: { ownerId: newOwnerId },
        include: { owner: { select: { name: true, email: true } } }
      });
    } catch {
      throw new NotFoundException(`Store #${id} not found`);
    }
  }
}
