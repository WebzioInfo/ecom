import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Product } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsDto } from './dto/list-products.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.prisma.client.product.create({ data: createProductDto as any });
  }

  async findAll(query: ListProductsDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, query.limit || 12);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = { isActive: true };
    if (query.category) where.category = query.category;
    if (query.brand) where.brand = query.brand;

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }

    if (query.inStock) where.stock = { gt: 0 };
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (query.sortBy === 'priceAsc') orderBy.price = 'asc';
    else if (query.sortBy === 'priceDesc') orderBy.price = 'desc';
    else if (query.sortBy === 'rating') orderBy.rating = 'desc';
    else if (query.sortBy === 'newest') orderBy.createdAt = 'desc';
    else orderBy.title = 'asc';

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

  async remove(id: string) {
    try {
      await this.prisma.client.product.delete({ where: { id } });
      return { success: true };
    } catch {
      throw new NotFoundException('Product not found');
    }
  }

  async getCategories(): Promise<string[]> {
    const products = await this.prisma.client.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    return products.map((p: any) => p.category);
  }

  async getBrands(): Promise<string[]> {
    const products = await this.prisma.client.product.findMany({
      select: { brand: true },
      distinct: ['brand'],
    });
    return products.map((p: any) => p.brand);
  }

  async findFeatured(limit = 8) {
    return this.prisma.client.product.findMany({
      where: { isActive: true },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
        { rating: 'desc' }
      ],
      take: limit,
    });
  }
}
