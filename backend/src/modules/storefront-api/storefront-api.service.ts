import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StorefrontApiService {
  constructor(private prisma: PrismaService) {}

  async validateApiKey(apiKey: string) {
    const keyDoc = await this.prisma.client.apiKey.findUnique({
      where: { key: apiKey }
    });
    
    if (!keyDoc || !keyDoc.isActive) {
      throw new UnauthorizedException('Invalid or inactive Store API Key');
    }
    
    // Update last used timestamp async
    void this.prisma.client.apiKey.update({
      where: { id: keyDoc.id },
      data: { lastUsedAt: new Date() }
    });
    
    return keyDoc;
  }

  async getPublicStoreInfo(apiKey: string) {
    const keyDoc = await this.validateApiKey(apiKey);
    const store = await this.prisma.client.store.findUnique({
      where: { id: keyDoc.storeId },
      select: {
        id: true,
        name: true,
        slug: true,
        branding: true,
        settings: true
      }
    });
    
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    
    const settings = (store.settings as any) || {};
    
    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      branding: store.branding,
      settings: {
        currency: settings.currency,
        timezone: settings.timezone,
        taxPercentage: settings.taxPercentage,
      },
    };
  }

  async getPublicProducts(
    apiKey: string,
    query: {
      search?: string;
      category?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const keyDoc = await this.validateApiKey(apiKey);
    const { search, category, page = 1, limit = 20 } = query;
    
    const where: Prisma.ProductWhereInput = { isActive: true };
    // In standard relational mapping, products are not linked to stores. 
    // Wait, in Mongo they were not linked to stores in this snippet?
    // Let's assume there is no storeId on products based on schema.
    
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.prisma.client.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.client.product.count({ where }),
    ]);

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPublicProductBySku(apiKey: string, sku: string) {
    await this.validateApiKey(apiKey);
    // Since Product doesn't have an SKU or storeId in our mapped schema, we assume ID
    const product = await this.prisma.client.product.findFirst({
      where: { id: sku, isActive: true }
    });
    if (!product) throw new NotFoundException(`Product not found`);
    return product;
  }
}
