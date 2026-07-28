import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Product } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsDto } from './dto/list-products.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const data: any = { ...createProductDto };
    if (!data.sku) {
      data.sku = `SKU-${Date.now().toString(36).toUpperCase()}`;
    }
    return this.prisma.client.product.create({ data });
  }

  async findAll(query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Number(query.limit) || 12);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.showDeleted === 'true') {
      where.isDeleted = true;
    } else {
      where.isDeleted = false;
    }

    if (query.category) where.category = query.category;
    if (query.brand) where.brand = query.brand;
    if (query.status) where.status = query.status;
    if (query.featured !== undefined) where.featured = query.featured === 'true';

    if (query.lowStock === 'true') {
      where.stock = { lte: 5 };
    } else if (query.inStock === 'true') {
      where.stock = { gt: 0 };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = Number(query.minPrice);
      if (query.maxPrice !== undefined) where.price.lte = Number(query.maxPrice);
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (query.sortBy === 'priceAsc') orderBy.price = 'asc';
    else if (query.sortBy === 'priceDesc') orderBy.price = 'desc';
    else if (query.sortBy === 'rating') orderBy.rating = 'desc';
    else if (query.sortBy === 'stock') orderBy.stock = 'asc';
    else if (query.sortBy === 'newest') orderBy.createdAt = 'desc';
    else orderBy.createdAt = 'desc';

    const [data, total] = await Promise.all([
      this.prisma.client.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.client.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.client.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    try {
      return await this.prisma.client.product.update({
        where: { id },
        data: updateProductDto as any,
      });
    } catch {
      throw new NotFoundException('Product not found');
    }
  }

  async softDelete(id: string) {
    try {
      return await this.prisma.client.product.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date(), isActive: false, status: 'ARCHIVED' },
      });
    } catch {
      throw new NotFoundException('Product not found');
    }
  }

  async restore(id: string) {
    try {
      return await this.prisma.client.product.update({
        where: { id },
        data: { isDeleted: false, deletedAt: null, isActive: true, status: 'PUBLISHED' },
      });
    } catch {
      throw new NotFoundException('Product not found');
    }
  }

  async remove(id: string) {
    return this.softDelete(id);
  }

  async bulkUpdate(ids: string[], data: any) {
    const result = await this.prisma.client.$transaction(async (tx: any) => {
      return tx.product.updateMany({
        where: { id: { in: ids } },
        data,
      });
    });
    return { success: true, count: result.count };
  }

  async bulkDelete(ids: string[]) {
    const result = await this.prisma.client.$transaction(async (tx: any) => {
      return tx.product.updateMany({
        where: { id: { in: ids } },
        data: { isDeleted: true, deletedAt: new Date(), isActive: false, status: 'ARCHIVED' },
      });
    });
    return { success: true, count: result.count };
  }

  async getCategories(): Promise<string[]> {
    const products = await this.prisma.client.product.findMany({
      where: { isDeleted: false },
      select: { category: true },
      distinct: ['category'],
    });
    return products.map((p: any) => p.category);
  }

  async getBrands(): Promise<string[]> {
    const products = await this.prisma.client.product.findMany({
      where: { isDeleted: false },
      select: { brand: true },
      distinct: ['brand'],
    });
    return products.map((p: any) => p.brand);
  }

  async findFeatured(limit = 8) {
    return this.prisma.client.product.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
        { rating: 'desc' }
      ],
      take: limit,
    });
  }
}
