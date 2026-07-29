import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-po.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-po.dto';
import { InventoryService } from '../inventory.service';
import { CatalogEventService } from '../../products/events/catalog-event.service';
import { PurchaseOrderStatus, StockMovementType } from '@prisma/client';

@Injectable()
export class PurchaseOrdersService {
  private readonly logger = new Logger(PurchaseOrdersService.name);

  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
    private eventService: CatalogEventService,
  ) {}

  async create(dto: CreatePurchaseOrderDto, userId?: string) {
    const existing = await this.prisma.tenant.purchaseOrder.findUnique({
      where: { poNumber: dto.poNumber },
    });
    if (existing) {
      throw new ConflictException(`PO Number '${dto.poNumber}' already exists.`);
    }

    const supplier = await this.prisma.tenant.supplier.findUnique({
      where: { id: dto.supplierId },
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier #${dto.supplierId} not found.`);
    }

    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantityOrdered * item.unitCost,
      0,
    );

    const po = await this.prisma.tenant.purchaseOrder.create({
      data: {
        poNumber: dto.poNumber,
        supplierId: dto.supplierId,
        status: PurchaseOrderStatus.DRAFT,
        totalAmount,
        notes: dto.notes,
        expectedAt: dto.expectedAt ? new Date(dto.expectedAt) : null,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            quantityOrdered: item.quantityOrdered,
            unitCost: item.unitCost,
          })),
        },
      },
      include: { items: true, supplier: true },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'PO_CREATE',
            entity: 'PurchaseOrder',
            entityId: po.id,
            changes: { poNumber: po.poNumber, totalAmount } as any,
          },
        });
      } catch {}
    }

    return po;
  }

  async findAll() {
    return this.prisma.tenant.purchaseOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: { supplier: { select: { id: true, name: true, code: true } }, items: true },
    });
  }

  async findOne(id: string) {
    const po = await this.prisma.tenant.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            product: { select: { id: true, title: true, sku: true } },
            variant: { select: { id: true, title: true, sku: true } },
          },
        },
      },
    });
    if (!po) throw new NotFoundException(`Purchase Order #${id} not found.`);
    return po;
  }

  async updateStatus(id: string, status: PurchaseOrderStatus, userId?: string) {
    const po = await this.findOne(id);
    if (po.status === PurchaseOrderStatus.RECEIVED) {
      throw new BadRequestException('Cannot change status of a fully RECEIVED Purchase Order.');
    }

    const updated = await this.prisma.tenant.purchaseOrder.update({
      where: { id },
      data: { status },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'PO_STATUS_CHANGE',
            entity: 'PurchaseOrder',
            entityId: id,
            changes: { status } as any,
          },
        });
      } catch {}
    }

    return updated;
  }

  async receiveGoods(id: string, dto: ReceivePurchaseOrderDto, userId?: string) {
    const po = await this.findOne(id);

    if (po.status === PurchaseOrderStatus.RECEIVED) {
      throw new BadRequestException(`Purchase Order '${po.poNumber}' has already been fully RECEIVED.`);
    }
    if (po.status === PurchaseOrderStatus.CANCELLED) {
      throw new BadRequestException(`Purchase Order '${po.poNumber}' is CANCELLED and cannot receive stock.`);
    }

    // Process each received item
    for (const itemDto of dto.items) {
      const poItem = po.items.find((i: any) => i.id === itemDto.itemId);
      if (!poItem) {
        throw new NotFoundException(`PO Item #${itemDto.itemId} not found on this Purchase Order.`);
      }

      // Adjust stock in inventory service
      await this.inventoryService.adjustStock(
        {
          productId: poItem.productId,
          variantId: poItem.variantId || undefined,
          warehouseId: dto.warehouseId,
          quantityDelta: itemDto.quantityReceived,
          type: StockMovementType.IN,
          reason: `PO Receipt [${po.poNumber}]`,
        },
        userId,
      );

      // Update quantityReceived on PO Item
      await this.prisma.tenant.purchaseOrderItem.update({
        where: { id: poItem.id },
        data: { quantityReceived: poItem.quantityReceived + itemDto.quantityReceived },
      });
    }

    // Re-evaluate PO Status
    const refreshedPo = await this.findOne(id);
    const allFullyReceived = refreshedPo.items.every(
      (item: any) => item.quantityReceived >= item.quantityOrdered,
    );

    const newStatus = allFullyReceived
      ? PurchaseOrderStatus.RECEIVED
      : PurchaseOrderStatus.ORDERED;

    const updatedPo = await this.prisma.tenant.purchaseOrder.update({
      where: { id },
      data: { status: newStatus },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'PO_RECEIVE_GOODS',
            entity: 'PurchaseOrder',
            entityId: id,
            changes: JSON.parse(JSON.stringify({ status: newStatus, receivedItems: dto.items })),
          },
        });
      } catch {}
    }

    // Emit Domain Events
    this.eventService.emit('purchase.received' as any, {
      poId: id,
      poNumber: po.poNumber,
      status: newStatus,
    });

    return updatedPo;
  }
}
