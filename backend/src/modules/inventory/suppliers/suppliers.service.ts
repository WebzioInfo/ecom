import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CatalogEventService } from '../../products/events/catalog-event.service';

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(
    private prisma: PrismaService,
    private eventService: CatalogEventService,
  ) {}

  async create(dto: CreateSupplierDto, userId?: string) {
    const existing = await this.prisma.tenant.supplier.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Supplier code '${dto.code}' already exists`);
    }

    const supplier = await this.prisma.tenant.supplier.create({
      data: {
        name: dto.name,
        code: dto.code,
        contactName: dto.contactName,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        isActive: dto.isActive ?? true,
      },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'SUPPLIER_CREATE',
            entity: 'Supplier',
            entityId: supplier.id,
            changes: { name: supplier.name, code: supplier.code },
          },
        });
      } catch {}
    }

    this.eventService.emit('supplier.created' as any, {
      supplierId: supplier.id,
      name: supplier.name,
      code: supplier.code,
    });

    return supplier;
  }

  async findAll() {
    return this.prisma.tenant.supplier.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { purchaseOrders: true } },
      },
    });
  }

  async findOne(id: string) {
    const supplier = await this.prisma.tenant.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: { take: 10, orderBy: { createdAt: 'desc' } },
        _count: { select: { purchaseOrders: true } },
      },
    });
    if (!supplier) throw new NotFoundException(`Supplier #${id} not found`);
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto, userId?: string) {
    const supplier = await this.findOne(id);

    if (dto.code && dto.code !== supplier.code) {
      const existingCode = await this.prisma.tenant.supplier.findUnique({
        where: { code: dto.code },
      });
      if (existingCode) {
        throw new ConflictException(`Supplier code '${dto.code}' already exists`);
      }
    }

    const updated = await this.prisma.tenant.supplier.update({
      where: { id },
      data: dto,
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'SUPPLIER_UPDATE',
            entity: 'Supplier',
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
    const deleted = await this.prisma.tenant.supplier.delete({
      where: { id },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'SUPPLIER_DELETE',
            entity: 'Supplier',
            entityId: id,
            changes: { name: deleted.name },
          },
        });
      } catch {}
    }

    return { message: `Supplier #${id} deleted successfully` };
  }
}
