import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = new this.orderModel({
      ...dto,
      storeId: new Types.ObjectId(dto.storeId),
      customerId: dto.customerId ? new Types.ObjectId(dto.customerId) : undefined,
      items: dto.items.map((i) => ({ ...i, product: new Types.ObjectId(i.product) })),
      orderNumber,
      timeline: [
        {
          status: OrderStatus.PENDING,
          description: 'Order created',
          timestamp: new Date(),
        },
      ],
    });

    return order.save();
  }

  async findByStore(storeId: string, query: { status?: string; search?: string; page?: number; limit?: number }) {
    const { status, search, page = 1, limit = 20 } = query;
    const filter: any = { storeId: new Types.ObjectId(storeId) };

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.orderModel.countDocuments(filter),
    ]);

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    if (dto.status && dto.status !== order.status) {
      order.status = dto.status;
      order.timeline.push({
        status: dto.status,
        description: `Order status updated to ${dto.status}`,
        timestamp: new Date(),
      });
    }

    if (dto.paymentStatus) {
      order.paymentStatus = dto.paymentStatus;
    }
    if (dto.trackingNumber) {
      order.trackingNumber = dto.trackingNumber;
    }
    if (dto.carrier) {
      order.carrier = dto.carrier;
    }
    if (dto.notes) {
      order.notes = dto.notes;
    }

    return order.save();
  }

  async getStoreOrderStats(storeId: string) {
    const objectId = new Types.ObjectId(storeId);
    const [totalOrders, pendingOrders, shippedOrders, deliveredOrders, revenueAggregation] = await Promise.all([
      this.orderModel.countDocuments({ storeId: objectId }),
      this.orderModel.countDocuments({ storeId: objectId, status: OrderStatus.PENDING }),
      this.orderModel.countDocuments({ storeId: objectId, status: OrderStatus.SHIPPED }),
      this.orderModel.countDocuments({ storeId: objectId, status: OrderStatus.DELIVERED }),
      this.orderModel.aggregate([
        { $match: { storeId: objectId } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
      ]),
    ]);

    return {
      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      totalRevenue: revenueAggregation[0]?.totalRevenue || 0,
    };
  }
}
