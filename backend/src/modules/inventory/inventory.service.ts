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

  async adjustStock(dto: any) {
    const delta = Number(dto.quantityDelta || dto.quantity || 0);
    const productId = dto.productId;

    let product = await this.prisma.client.product.findUnique({ where: { id: productId } });
    if (product) {
      const newStock = Math.max(0, product.stock + delta);
      product = await this.prisma.client.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });
    }

    const movement = await this.prisma.client.stockMovement.create({
      data: {
        productId,
        warehouseId: dto.warehouseId || null,
        type: delta >= 0 ? 'IN' : 'OUT',
        quantity: Math.abs(delta),
        reason: dto.reason || 'Manual Adjustment',
        createdBy: dto.createdBy || 'Store Admin',
      },
    });

    return { product, movement };
  }

  async getMovements(productId?: string) {
    const where: any = {};
    if (productId) where.productId = productId;
    return this.prisma.client.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getStockSummary() {
    const products = await this.prisma.client.product.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        title: true,
        sku: true,
        stock: true,
        minStock: true,
        category: true,
      },
    });

    const lowStock = products.filter((p: any) => p.stock <= (p.minStock || 5));
    const outOfStock = products.filter((p: any) => p.stock <= 0);

    return {
      products,
      totalItems: products.reduce((sum: number, p: any) => sum + p.stock, 0),
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      lowStock,
      outOfStock,
    };
  }
}
