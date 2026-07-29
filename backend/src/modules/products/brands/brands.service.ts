import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { ListBrandsDto } from './dto/list-brands.dto';
import { CatalogEventService } from '../events/catalog-event.service';

@Injectable()
export class BrandsService {
  private readonly logger = new Logger(BrandsService.name);

  constructor(
    private prisma: PrismaService,
    private eventService: CatalogEventService,
  ) {}

  async create(dto: CreateBrandDto, userId?: string) {
    const existing = await this.prisma.tenant.brand.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(`Brand with slug '${dto.slug}' already exists`);
    }

    const brand = await this.prisma.tenant.brand.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        logo: dto.logo,
        website: dto.website,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
    });

    // Create Audit Log
    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'BRAND_CREATE',
            entity: 'Brand',
            entityId: brand.id,
            changes: { name: brand.name, slug: brand.slug },
          },
        });
      } catch (e) {
        this.logger.warn(`Failed to write AuditLog for Brand ${brand.id}`);
      }
    }

    // Emit Domain Event
    this.eventService.emit('brand.created', {
      brandId: brand.id,
      name: brand.name,
      slug: brand.slug,
    });

    return brand;
  }

  async findAll(query: ListBrandsDto) {
    const { search, isActive, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.tenant.brand.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.tenant.brand.count({ where }),
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
    const brand = await this.prisma.tenant.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundException(`Brand #${id} not found`);
    return brand;
  }

  async findBySlug(slug: string) {
    const brand = await this.prisma.tenant.brand.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundException(`Brand '${slug}' not found`);
    return brand;
  }

  async update(id: string, dto: UpdateBrandDto, userId?: string) {
    const brand = await this.findOne(id);

    if (dto.slug && dto.slug !== brand.slug) {
      const existingSlug = await this.prisma.tenant.brand.findUnique({
        where: { slug: dto.slug },
      });
      if (existingSlug) {
        throw new ConflictException(`Brand slug '${dto.slug}' already exists`);
      }
    }

    const updated = await this.prisma.tenant.brand.update({
      where: { id },
      data: dto,
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'BRAND_UPDATE',
            entity: 'Brand',
            entityId: updated.id,
            changes: dto as any,
          },
        });
      } catch {}
    }

    return updated;
  }

  async remove(id: string, userId?: string) {
    await this.findOne(id);
    const deleted = await this.prisma.tenant.brand.delete({
      where: { id },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'BRAND_DELETE',
            entity: 'Brand',
            entityId: id,
            changes: { name: deleted.name },
          },
        });
      } catch {}
    }

    return { message: `Brand #${id} deleted successfully` };
  }
}
