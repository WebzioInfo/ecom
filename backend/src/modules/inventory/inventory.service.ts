import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Warehouse } from '@prisma/client';
import { CreateWarehouseDto, AdjustStockDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async createWarehouse(dto: CreateWarehouseDto): Promise<Warehouse> {
    return this.prisma.client.warehouse.create({
      data: {
        ...dto,
        storeId: dto.storeId,
      } as any
    });
  }

  async findWarehousesByStore(storeId: string) {
    return this.prisma.client.warehouse.findMany({
      where: { storeId }
    });
  }

  adjustStock(dto: AdjustStockDto) {
    return {
      storeId: dto.storeId,
      warehouseId: dto.warehouseId,
      productId: dto.productId,
      quantityDelta: dto.quantityDelta,
      reason: dto.reason || 'Manual Adjustment',
      updatedAt: new Date(),
    };
  }
}
