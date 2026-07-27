import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await this.prisma.client.category.findFirst({
      where: { OR: [{ name: dto.name }, { slug }], isDeleted: false },
    });
    if (existing) {
      throw new ConflictException('Category with this name or slug already exists');
    }

    const data: any = {
      name: dto.name,
      slug,
      description: dto.description || null,
      banner: dto.banner || null,
      image: dto.image || null,
      sortOrder: dto.sortOrder || 0,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    };

    if (dto.parentId) {
      data.parent = { connect: { id: dto.parentId } };
    }

    return this.prisma.client.category.create({ data });
  }

  async findAll() {
    const categories = await this.prisma.client.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const products = await this.prisma.client.product.findMany({
      where: { isDeleted: false },
      select: { category: true },
    });

    const countMap = new Map<string, number>();
    products.forEach((p: any) => {
      if (p.category) {
        countMap.set(p.category.toLowerCase(), (countMap.get(p.category.toLowerCase()) || 0) + 1);
      }
    });

    const enriched = categories.map((cat: any) => ({
      ...cat,
      productCount: countMap.get((cat.name || '').toLowerCase()) || 0,
    }));

    const activeCategories = enriched.filter((c: any) => !c.isDeleted);

    // Build hierarchy for tree
    const map = new Map<string, any>();
    const tree: any[] = [];

    activeCategories.forEach((cat: any) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    activeCategories.forEach((cat: any) => {
      const node = map.get(cat.id);
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId).children.push(node);
      } else {
        tree.push(node);
      }
    });

    return { flat: enriched, tree };
  }

  async getDropdown() {
    const categories = await this.prisma.client.category.findMany({
      where: { isDeleted: false, isActive: true },
      select: { id: true, name: true, slug: true, parentId: true },
      orderBy: { name: 'asc' },
    });
    return categories;
  }

  async findOne(id: string) {
    const category = await this.prisma.client.category.findUnique({
      where: { id },
      include: { children: true, parent: true },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    const data: any = {
      ...(dto.name && { name: dto.name }),
      ...(dto.slug && { slug: dto.slug }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.banner !== undefined && { banner: dto.banner }),
      ...(dto.image !== undefined && { image: dto.image }),
      ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    };

    if (dto.parentId) {
      data.parent = { connect: { id: dto.parentId } };
    } else if (dto.parentId === null) {
      data.parent = { disconnect: true };
    }

    return this.prisma.client.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.category.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), isActive: false },
    });
  }

  async restore(id: string) {
    await this.findOne(id);
    return this.prisma.client.category.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null, isActive: true },
    });
  }

  async permanentDelete(id: string) {
    await this.findOne(id);
    return this.prisma.client.category.delete({
      where: { id },
    });
  }
}
