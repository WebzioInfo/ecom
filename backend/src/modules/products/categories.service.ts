import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './categories/dto/create-category.dto';
import { UpdateCategoryDto } from './categories/dto/update-category.dto';
import { CatalogEventService } from './events/catalog-event.service';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    private prisma: PrismaService,
    private eventService: CatalogEventService,
  ) {}

  async create(dto: CreateCategoryDto, userId?: string) {
    const existing = await this.prisma.tenant.category.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(`Category slug '${dto.slug}' already exists`);
    }

    if (dto.parentId) {
      const parent = await this.prisma.tenant.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException(`Parent Category #${dto.parentId} does not exist`);
      }
    }

    const category = await this.prisma.tenant.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        image: dto.image,
        banner: dto.banner,
        parentId: dto.parentId || null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'CATEGORY_CREATE',
            entity: 'Category',
            entityId: category.id,
            changes: { name: category.name, slug: category.slug },
          },
        });
      } catch {}
    }

    this.eventService.emit('category.created', {
      categoryId: category.id,
      name: category.name,
      slug: category.slug,
    });

    return category;
  }

  async findAll(includeInactive = false) {
    const where: any = { isDeleted: false };
    if (!includeInactive) where.isActive = true;

    return this.prisma.tenant.category.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true, children: true } },
      },
    });
  }

  async findTree() {
    // Return root categories with recursive children
    const roots = await this.prisma.tenant.category.findMany({
      where: { parentId: null, isDeleted: false, isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where: { isDeleted: false, isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            children: {
              where: { isDeleted: false, isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });
    return roots;
  }

  async findOne(id: string) {
    const category = await this.prisma.tenant.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: { where: { isDeleted: false } },
        _count: { select: { products: true } },
      },
    });
    if (!category || category.isDeleted) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.tenant.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: { where: { isDeleted: false } },
        _count: { select: { products: true } },
      },
    });
    if (!category || category.isDeleted) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto, userId?: string) {
    const category = await this.findOne(id);

    if (dto.slug && dto.slug !== category.slug) {
      const existingSlug = await this.prisma.tenant.category.findUnique({
        where: { slug: dto.slug },
      });
      if (existingSlug) {
        throw new ConflictException(`Category slug '${dto.slug}' already exists`);
      }
    }

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('A category cannot be its own parent');
      }
      const parent = await this.prisma.tenant.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException(`Parent Category #${dto.parentId} does not exist`);
      }
    }

    const updated = await this.prisma.tenant.category.update({
      where: { id },
      data: dto,
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'CATEGORY_UPDATE',
            entity: 'Category',
            entityId: id,
            changes: dto as any,
          },
        });
      } catch {}
    }

    return updated;
  }

  async remove(id: string, userId?: string) {
    await this.findOne(id);

    const updated = await this.prisma.tenant.category.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), isActive: false },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'CATEGORY_DELETE',
            entity: 'Category',
            entityId: id,
            changes: { name: updated.name },
          },
        });
      } catch {}
    }

    return { message: `Category #${id} soft deleted successfully` };
  }
}
