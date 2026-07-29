import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { CatalogEventService } from './events/catalog-event.service';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private prisma: PrismaService,
    private eventService: CatalogEventService,
  ) {}

  async create(dto: CreateProductDto, userId?: string) {
    // 1. Validate Product Offer Price
    if (dto.offerPrice !== undefined && dto.offerPrice >= dto.price) {
      throw new BadRequestException('Offer price must be strictly less than standard price.');
    }

    // 2. Validate Product Slug Uniqueness
    const existingSlug = await this.prisma.tenant.product.findUnique({
      where: { slug: dto.slug },
    });
    if (existingSlug) {
      throw new ConflictException(`Product slug '${dto.slug}' already exists.`);
    }

    // 3. Validate Main Product SKU Uniqueness if provided
    if (dto.sku) {
      const existingSku = await this.prisma.tenant.product.findUnique({
        where: { sku: dto.sku },
      });
      if (existingSku) {
        throw new ConflictException(`Product SKU '${dto.sku}' already exists.`);
      }
    }

    // 4. Validate Category & Brand Existence
    if (dto.categoryId) {
      const category = await this.prisma.tenant.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category || category.isDeleted) {
        throw new BadRequestException(`Category #${dto.categoryId} does not exist.`);
      }
    }

    if (dto.brandId) {
      const brand = await this.prisma.tenant.brand.findUnique({
        where: { id: dto.brandId },
      });
      if (!brand) {
        throw new BadRequestException(`Brand #${dto.brandId} does not exist.`);
      }
    }

    // 5. Validate Variants & Variant SKUs
    const variants = dto.variants || [];
    const variantSkus = new Set<string>();
    const variantCombinations = new Set<string>();

    for (const v of variants) {
      if (v.offerPrice !== undefined && v.offerPrice >= v.price) {
        throw new BadRequestException(`Variant '${v.title}' offer price must be less than price.`);
      }

      if (variantSkus.has(v.sku)) {
        throw new BadRequestException(`Duplicate variant SKU '${v.sku}' in payload.`);
      }
      variantSkus.add(v.sku);

      // Check if SKU exists in DB
      const existingVariantSku = await this.prisma.tenant.productVariant.findUnique({
        where: { sku: v.sku },
      });
      if (existingVariantSku) {
        throw new ConflictException(`Variant SKU '${v.sku}' already exists in tenant database.`);
      }

      // Check variant attribute combination uniqueness
      if (v.attributeValueIds && v.attributeValueIds.length > 0) {
        const comboKey = [...v.attributeValueIds].sort().join(':');
        if (variantCombinations.has(comboKey)) {
          throw new BadRequestException(`Duplicate attribute combination for variant '${v.title}'.`);
        }
        variantCombinations.add(comboKey);
      }
    }

    // 6. Validate Publishing Rule
    if (dto.status === ProductStatus.PUBLISHED) {
      const activeVariantsCount = variants.filter((v) => v.isActive !== false).length;
      if (variants.length > 0 && activeVariantsCount === 0) {
        throw new BadRequestException('Product cannot be published without at least one active variant.');
      }
    }

    // 7. Execute Transactional Creation
    const createdProduct = await this.prisma.tenant.$transaction(async (tx: any) => {
      // Create Base Product
      const product = await tx.product.create({
        data: {
          title: dto.title,
          slug: dto.slug,
          sku: dto.sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
          barcode: dto.barcode,
          shortDescription: dto.shortDescription,
          description: dto.description,
          price: dto.price,
          offerPrice: dto.offerPrice,
          costPrice: dto.costPrice,
          stock: dto.stock ?? 0,
          minStock: dto.minStock ?? 5,
          weight: dto.weight,
          tax: dto.tax,
          brandId: dto.brandId || null,
          categoryId: dto.categoryId || null,
          status: dto.status || ProductStatus.DRAFT,
          featured: dto.featured ?? false,
          isActive: dto.isActive ?? true,
          seoTitle: dto.seoTitle,
          seoDescription: dto.seoDescription,
          tags: dto.tags || [],
        },
      });

      // Create Product Media Gallery
      if (dto.media && dto.media.length > 0) {
        await tx.productMedia.createMany({
          data: dto.media.map((m, index) => ({
            productId: product.id,
            url: m.url,
            altText: m.altText,
            position: m.position ?? index,
            isPrimary: m.isPrimary ?? index === 0,
          })),
        });
      }

      // Create Product Variants & Variant Value Junctions
      if (variants.length > 0) {
        for (const v of variants) {
          const createdVariant = await tx.productVariant.create({
            data: {
              productId: product.id,
              title: v.title,
              sku: v.sku,
              barcode: v.barcode,
              price: v.price,
              offerPrice: v.offerPrice,
              costPrice: v.costPrice,
              stock: v.stock ?? 0,
              weight: v.weight,
              isActive: v.isActive ?? true,
            },
          });

          if (v.attributeValueIds && v.attributeValueIds.length > 0) {
            await tx.productVariantValue.createMany({
              data: v.attributeValueIds.map((attrValId) => ({
                variantId: createdVariant.id,
                attributeValueId: attrValId,
              })),
            });
          }
        }
      }

      return product;
    });

    // Write Audit Log
    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'PRODUCT_CREATE',
            entity: 'Product',
            entityId: createdProduct.id,
            changes: { title: createdProduct.title, slug: createdProduct.slug, status: createdProduct.status },
          },
        });
      } catch {}
    }

    // Emit Domain Event
    this.eventService.emit('product.created', {
      productId: createdProduct.id,
      title: createdProduct.title,
      slug: createdProduct.slug,
      price: createdProduct.price,
    });

    if (createdProduct.status === ProductStatus.PUBLISHED) {
      this.eventService.emit('product.published', {
        productId: createdProduct.id,
        title: createdProduct.title,
      });
    }

    return this.findOne(createdProduct.id);
  }

  async findAll(query: ListProductsDto) {
    const {
      search,
      category,
      brand,
      status,
      featured,
      minPrice,
      maxPrice,
      sortBy,
      page = 1,
      limit = 12,
    } = query;

    const skip = (page - 1) * limit;
    const where: any = { isDeleted: false };

    if (status) where.status = status;
    if (featured !== undefined) where.featured = featured;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = Number(minPrice);
      if (maxPrice !== undefined) where.price.lte = Number(maxPrice);
    }

    if (category) {
      where.OR = [
        { categoryId: category },
        { category: { slug: category } },
      ];
    }

    if (brand) {
      where.OR = [
        { brandId: brand },
        { brand: { slug: brand } },
      ];
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sortBy === 'priceAsc') orderBy.price = 'asc';
    else if (sortBy === 'priceDesc') orderBy.price = 'desc';
    else if (sortBy === 'title') orderBy.title = 'asc';
    else orderBy.createdAt = 'desc';

    const [data, total] = await Promise.all([
      this.prisma.tenant.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true, logo: true } },
          media: { orderBy: { position: 'asc' } },
          variants: {
            where: { isActive: true },
            include: {
              variantValues: {
                include: {
                  attributeValue: {
                    include: { attribute: true },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.tenant.product.count({ where }),
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
    const product = await this.prisma.tenant.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        media: { orderBy: { position: 'asc' } },
        variants: {
          include: {
            variantValues: {
              include: {
                attributeValue: {
                  include: { attribute: true },
                },
              },
            },
          },
        },
      },
    });

    if (!product || product.isDeleted) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.tenant.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        media: { orderBy: { position: 'asc' } },
        variants: {
          include: {
            variantValues: {
              include: {
                attributeValue: {
                  include: { attribute: true },
                },
              },
            },
          },
        },
      },
    });

    if (!product || product.isDeleted) {
      throw new NotFoundException(`Product with slug '${slug}' not found`);
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto, userId?: string) {
    const product = await this.findOne(id);

    if (dto.slug && dto.slug !== product.slug) {
      const existingSlug = await this.prisma.tenant.product.findUnique({
        where: { slug: dto.slug },
      });
      if (existingSlug) {
        throw new ConflictException(`Product slug '${dto.slug}' already exists.`);
      }
    }

    if (dto.offerPrice !== undefined && dto.offerPrice >= (dto.price || product.price)) {
      throw new BadRequestException('Offer price must be less than price.');
    }

    const { media, variants, ...productData } = dto;

    const updated = await this.prisma.tenant.product.update({
      where: { id },
      data: productData as any,
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'PRODUCT_UPDATE',
            entity: 'Product',
            entityId: id,
            changes: dto as any,
          },
        });
      } catch {}
    }

    this.eventService.emit('product.updated', {
      productId: updated.id,
      title: updated.title,
    });

    return this.findOne(id);
  }

  async publish(id: string, userId?: string) {
    const product = await this.findOne(id);

    const activeVariants = product.variants?.filter((v: any) => v.isActive);
    if (!activeVariants || activeVariants.length === 0) {
      throw new BadRequestException('Product cannot be published without at least one active variant.');
    }

    const updated = await this.prisma.tenant.product.update({
      where: { id },
      data: { status: ProductStatus.PUBLISHED, isActive: true },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'PRODUCT_PUBLISH',
            entity: 'Product',
            entityId: id,
            changes: { status: 'PUBLISHED' },
          },
        });
      } catch {}
    }

    this.eventService.emit('product.published', {
      productId: id,
      title: updated.title,
    });

    return updated;
  }

  async archive(id: string, userId?: string) {
    await this.findOne(id);
    const updated = await this.prisma.tenant.product.update({
      where: { id },
      data: { status: ProductStatus.ARCHIVED, isActive: false },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'PRODUCT_ARCHIVE',
            entity: 'Product',
            entityId: id,
            changes: { status: 'ARCHIVED' },
          },
        });
      } catch {}
    }

    return updated;
  }

  async softDelete(id: string, userId?: string) {
    await this.findOne(id);
    const updated = await this.prisma.tenant.product.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
        status: ProductStatus.ARCHIVED,
      },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'PRODUCT_DELETE',
            entity: 'Product',
            entityId: id,
            changes: { isDeleted: true },
          },
        });
      } catch {}
    }

    this.eventService.emit('product.deleted', {
      productId: id,
      title: updated.title,
    });

    return { message: `Product #${id} soft deleted successfully` };
  }

  async bulkDelete(ids: string[], userId?: string) {
    if (!ids || ids.length === 0) return { message: 'No IDs provided' };

    const result = await this.prisma.tenant.product.updateMany({
      where: { id: { in: ids } },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
        status: ProductStatus.ARCHIVED,
      },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'PRODUCT_BULK_DELETE',
            entity: 'Product',
            entityId: 'BULK',
            changes: { count: result.count, ids },
          },
        });
      } catch {}
    }

    ids.forEach(id => {
      this.eventService.emit('product.deleted', {
        productId: id,
        title: 'Bulk Deleted Product',
      });
    });

    return { message: `${result.count} products soft deleted successfully` };
  }

  async remove(id: string, userId?: string) {
    return this.softDelete(id, userId);
  }
}
