import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { CatalogEventService } from '../products/events/catalog-event.service';
import { StockMovementType } from '@prisma/client';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private prisma: PrismaService,
    private eventService: CatalogEventService,
  ) {}

  private async getDefaultWarehouseId(): Promise<string> {
    const warehouse = await this.prisma.tenant.warehouse.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!warehouse) {
      throw new NotFoundException('No active warehouse found in tenant schema.');
    }
    return warehouse.id;
  }

  async adjustStock(dto: AdjustStockDto, userId?: string) {
    const delta = Number(dto.quantityDelta || 0);
    if (delta === 0) {
      throw new BadRequestException('Stock quantity delta cannot be zero.');
    }

    const warehouseId = dto.warehouseId || (await this.getDefaultWarehouseId());

    // 1. Verify Product & Variant existence
    const product = await this.prisma.tenant.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product || product.isDeleted) {
      throw new NotFoundException(`Product #${dto.productId} not found.`);
    }

    let variant = null;
    if (dto.variantId) {
      variant = await this.prisma.tenant.productVariant.findUnique({
        where: { id: dto.variantId },
      });
      if (!variant) {
        throw new NotFoundException(`Product Variant #${dto.variantId} not found.`);
      }
    }

    // 2. Transactional Stock Adjustment & Movement Recording
    const result = await this.prisma.tenant.$transaction(async (tx: any) => {
      // Find or create InventoryItem
      let inventoryItem = await tx.inventoryItem.findFirst({
        where: {
          productId: dto.productId,
          variantId: dto.variantId || null,
          warehouseId,
        },
      });

      const quantityBefore = inventoryItem ? inventoryItem.quantity : 0;
      const quantityAfter = quantityBefore + delta;

      if (quantityAfter < 0) {
        throw new BadRequestException(
          `Adjustment rejected. Available stock (${quantityBefore}) cannot drop below zero (requested change: ${delta}).`,
        );
      }

      if (!inventoryItem) {
        inventoryItem = await tx.inventoryItem.create({
          data: {
            productId: dto.productId,
            variantId: dto.variantId || null,
            warehouseId,
            quantity: quantityAfter,
          },
        });
      } else {
        inventoryItem = await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { quantity: quantityAfter },
        });
      }

      // Update total Product or Variant stock
      if (variant) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: Math.max(0, variant.stock + delta) },
        });
      } else {
        await tx.product.update({
          where: { id: product.id },
          data: { stock: Math.max(0, product.stock + delta) },
        });
      }

      // Create Immutable StockMovement Ledger Entry
      const movement = await tx.stockMovement.create({
        data: {
          productId: dto.productId,
          variantId: dto.variantId || null,
          warehouseId,
          type: dto.type || (delta > 0 ? StockMovementType.IN : StockMovementType.OUT),
          quantity: delta,
          reason: dto.reason || `Stock Adjustment (${quantityBefore} -> ${quantityAfter})`,
          createdBy: userId || 'System',
        },
      });

      return { inventoryItem, movement, quantityBefore, quantityAfter };
    });

    // 3. Emit Domain Events
    this.eventService.emit('inventory.updated' as any, {
      productId: dto.productId,
      variantId: dto.variantId,
      warehouseId,
      newStock: result.quantityAfter,
    });

    const reorderPoint = result.inventoryItem.reorderPoint || 5;
    if (result.quantityAfter <= reorderPoint) {
      this.eventService.emit('inventory.low_stock' as any, {
        productId: dto.productId,
        variantId: dto.variantId,
        warehouseId,
        currentStock: result.quantityAfter,
        reorderPoint,
      });
    }

    return result;
  }

  async transferStock(dto: TransferStockDto, userId?: string) {
    if (dto.fromWarehouseId === dto.toWarehouseId) {
      throw new BadRequestException('Source and destination warehouses must be different.');
    }

    // Deduct from source warehouse
    await this.adjustStock(
      {
        productId: dto.productId,
        variantId: dto.variantId,
        warehouseId: dto.fromWarehouseId,
        quantityDelta: -dto.quantity,
        type: StockMovementType.TRANSFER,
        reason: dto.reason || `Transfer Out to Warehouse #${dto.toWarehouseId}`,
      },
      userId,
    );

    // Add to destination warehouse
    await this.adjustStock(
      {
        productId: dto.productId,
        variantId: dto.variantId,
        warehouseId: dto.toWarehouseId,
        quantityDelta: dto.quantity,
        type: StockMovementType.TRANSFER,
        reason: dto.reason || `Transfer In from Warehouse #${dto.fromWarehouseId}`,
      },
      userId,
    );

    return { success: true, message: `Successfully transferred ${dto.quantity} items.` };
  }

  async reserveStock(dto: ReserveStockDto) {
    const warehouseId = dto.warehouseId || (await this.getDefaultWarehouseId());

    const item = await this.prisma.tenant.inventoryItem.findFirst({
      where: {
        productId: dto.productId,
        variantId: dto.variantId || null,
        warehouseId,
      },
    });

    if (!item || item.quantity - item.reservedQuantity < dto.quantity) {
      throw new BadRequestException('Insufficient available stock to reserve.');
    }

    return this.prisma.tenant.inventoryItem.update({
      where: { id: item.id },
      data: { reservedQuantity: item.reservedQuantity + dto.quantity },
    });
  }

  async getMovements(productId?: string, warehouseId?: string) {
    const where: any = {};
    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;

    return this.prisma.tenant.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        product: { select: { id: true, title: true, sku: true } },
        variant: { select: { id: true, title: true, sku: true } },
        warehouse: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async getStockSummary() {
    const items = await this.prisma.tenant.inventoryItem.findMany({
      include: {
        product: { select: { id: true, title: true, sku: true } },
        variant: { select: { id: true, title: true, sku: true } },
        warehouse: { select: { id: true, name: true, code: true } },
      },
    });

    const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = items.filter((item) => item.quantity <= item.reorderPoint);
    const outOfStockItems = items.filter((item) => item.quantity <= 0);

    return {
      items,
      totalStock,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      lowStockItems,
      outOfStockItems,
    };
  }
}
