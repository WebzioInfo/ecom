import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { CatalogEventService } from '../../products/events/catalog-event.service';

@Injectable()
export class WarehousesService {
  private readonly logger = new Logger(WarehousesService.name);

  constructor(
    private prisma: PrismaService,
    private eventService: CatalogEventService,
  ) {}

  async create(dto: CreateWarehouseDto, userId?: string) {
    const existing = await this.prisma.tenant.warehouse.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Warehouse code '${dto.code}' already exists`);
    }

    const warehouse = await this.prisma.tenant.warehouse.create({
      data: {
        name: dto.name,
        code: dto.code,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        postalCode: dto.postalCode,
        isActive: dto.isActive ?? true,
      },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'WAREHOUSE_CREATE',
            entity: 'Warehouse',
            entityId: warehouse.id,
            changes: { name: warehouse.name, code: warehouse.code },
          },
        });
      } catch {}
    }

    this.eventService.emit('warehouse.created' as any, {
      warehouseId: warehouse.id,
      name: warehouse.name,
      code: warehouse.code,
    });

    return warehouse;
  }

  async findAll() {
    return this.prisma.tenant.warehouse.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { inventoryItems: true, stockMovements: true } },
      },
    });
  }

  async findOne(id: string) {
    const warehouse = await this.prisma.tenant.warehouse.findUnique({
      where: { id },
      include: {
        _count: { select: { inventoryItems: true, stockMovements: true } },
      },
    });
    if (!warehouse) throw new NotFoundException(`Warehouse #${id} not found`);
    return warehouse;
  }

  async update(id: string, dto: UpdateWarehouseDto, userId?: string) {
    const warehouse = await this.findOne(id);

    if (dto.code && dto.code !== warehouse.code) {
      const existingCode = await this.prisma.tenant.warehouse.findUnique({
        where: { code: dto.code },
      });
      if (existingCode) {
        throw new ConflictException(`Warehouse code '${dto.code}' already exists`);
      }
    }

    if (dto.isActive === false) {
      const activeCount = await this.prisma.tenant.warehouse.count({
        where: { isActive: true, id: { not: id } },
      });
      if (activeCount === 0) {
        throw new BadRequestException('Cannot de-activate the last active warehouse in the tenant schema.');
      }
    }

    const updated = await this.prisma.tenant.warehouse.update({
      where: { id },
      data: dto,
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'WAREHOUSE_UPDATE',
            entity: 'Warehouse',
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

    const activeCount = await this.prisma.tenant.warehouse.count({
      where: { isActive: true, id: { not: id } },
    });
    if (activeCount === 0) {
      throw new BadRequestException('Cannot delete the last remaining active warehouse.');
    }

    const deleted = await this.prisma.tenant.warehouse.delete({
      where: { id },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'WAREHOUSE_DELETE',
            entity: 'Warehouse',
            entityId: id,
            changes: { name: deleted.name },
          },
        });
      } catch {}
    }

    return { message: `Warehouse #${id} deleted successfully` };
  }
}
