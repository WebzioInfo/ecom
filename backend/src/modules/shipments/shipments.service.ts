import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { CatalogEventService } from '../products/events/catalog-event.service';
import { ShipmentStatus, OrderStatus, FulfillmentStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class ShipmentsService {
  private readonly logger = new Logger(ShipmentsService.name);

  private readonly allowedShipmentTransitions: Record<string, string[]> = {
    LABEL_CREATED: ['PICKED_UP', 'IN_TRANSIT', 'FAILED'],
    PICKED_UP: ['IN_TRANSIT', 'ARRIVED_AT_HUB', 'FAILED'],
    IN_TRANSIT: ['ARRIVED_AT_HUB', 'OUT_FOR_DELIVERY', 'FAILED'],
    ARRIVED_AT_HUB: ['OUT_FOR_DELIVERY', 'FAILED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
    DELIVERED: [],
    FAILED: ['RETURN_TO_ORIGIN'],
    RETURN_TO_ORIGIN: [],
  };

  constructor(
    private prisma: PrismaService,
    private eventService: CatalogEventService,
  ) {}

  private async generateTrackingNumber(): Promise<string> {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.tenant.shipment.count();
    return `TRK-${todayStr}-${(count + 1).toString().padStart(6, '0')}`;
  }

  async create(dto: CreateShipmentDto, userId?: string) {
    const order = await this.prisma.tenant.order.findUnique({
      where: { id: dto.orderId },
      include: { payments: true },
    });

    if (!order) {
      throw new NotFoundException(`Order #${dto.orderId} not found.`);
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(`Cannot create shipment for CANCELLED order '${order.orderNumber}'.`);
    }

    // Cannot ship unpaid orders unless payment method is COD
    const hasCodPayment = order.payments.some((p) => p.gateway === 'COD');
    if (order.paymentStatus === PaymentStatus.UNPAID && !hasCodPayment) {
      throw new BadRequestException(`Cannot ship UNPAID order '${order.orderNumber}'.`);
    }

    const trackingNumber = dto.trackingNumber || (await this.generateTrackingNumber());

    const shipment = await this.prisma.tenant.shipment.create({
      data: {
        orderId: dto.orderId,
        shipmentNumber: trackingNumber,
        trackingNumber,
        trackingUrl: dto.trackingUrl,
        courier: dto.courier || 'Standard Logistics',
        status: ShipmentStatus.LABEL_CREATED,
      },
    });

    await this.prisma.tenant.order.update({
      where: { id: dto.orderId },
      data: { fulfillmentStatus: FulfillmentStatus.FULFILLED },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'SHIPMENT_CREATE',
            entity: 'Shipment',
            entityId: shipment.id,
            changes: { trackingNumber, courier: shipment.courier } as any,
          },
        });
      } catch {}
    }

    this.eventService.emit('shipment.created' as any, {
      shipmentId: shipment.id,
      orderId: dto.orderId,
      trackingNumber,
    });

    return shipment;
  }

  async updateStatus(id: string, dto: UpdateShipmentStatusDto, userId?: string) {
    const shipment = await this.prisma.tenant.shipment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!shipment) throw new NotFoundException(`Shipment #${id} not found.`);
    const currentStatus = shipment.status;

    const allowed = this.allowedShipmentTransitions[currentStatus] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid shipment status transition from '${currentStatus}' to '${dto.status}'.`,
      );
    }

    const isDelivered = dto.status === ShipmentStatus.DELIVERED;
    const isShipped =
      dto.status === ShipmentStatus.IN_TRANSIT ||
      dto.status === ShipmentStatus.OUT_FOR_DELIVERY;

    const updatedShipment = await this.prisma.tenant.shipment.update({
      where: { id },
      data: {
        status: dto.status,
        shippedAt: isShipped && !shipment.shippedAt ? new Date() : shipment.shippedAt,
        deliveredAt: isDelivered ? new Date() : shipment.deliveredAt,
      },
    });

    // Synchronize Order Status dynamically
    if (isShipped && shipment.order.status !== OrderStatus.SHIPPED) {
      await this.prisma.tenant.order.update({
        where: { id: shipment.orderId },
        data: { status: OrderStatus.SHIPPED, fulfillmentStatus: FulfillmentStatus.FULFILLED },
      });
    } else if (isDelivered) {
      await this.prisma.tenant.order.update({
        where: { id: shipment.orderId },
        data: { status: OrderStatus.DELIVERED, fulfillmentStatus: FulfillmentStatus.FULFILLED },
      });
    }

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'SHIPMENT_STATUS_UPDATE',
            entity: 'Shipment',
            entityId: id,
            changes: { from: currentStatus, to: dto.status } as any,
          },
        });
      } catch {}
    }

    this.eventService.emit('shipment.updated' as any, {
      shipmentId: id,
      orderId: shipment.orderId,
      status: dto.status,
    });

    if (isDelivered) {
      this.eventService.emit('shipment.delivered' as any, {
        shipmentId: id,
        orderId: shipment.orderId,
      });
    }

    return updatedShipment;
  }

  async findAll() {
    return this.prisma.tenant.shipment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { order: { select: { id: true, orderNumber: true, totalAmount: true } } },
    });
  }

  async findOne(id: string) {
    const shipment = await this.prisma.tenant.shipment.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!shipment) throw new NotFoundException(`Shipment #${id} not found.`);
    return shipment;
  }
}
