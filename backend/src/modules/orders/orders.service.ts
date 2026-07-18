import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { CartService } from '../cart/cart.service';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { Cart } from '../cart/schemas/cart.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private configService: ConfigService,
    private cartService: CartService,
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    const items = createOrderDto.items?.map((item) => ({
      product: new Types.ObjectId(item.productId),
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase,
    })) || [];

    let orderItems = items;
    if (!items.length) {
      const cart = await this.cartService.getCart(userId);
      orderItems = cart.items.map((item) => ({
        product: new Types.ObjectId((item.product as any)._id || item.product),
        quantity: item.quantity,
        priceAtPurchase: (item.product as any).price ?? 0,
      }));
    }

    const totalAmount = orderItems.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);
    const order = new this.orderModel({
      user: new Types.ObjectId(userId),
      items: orderItems,
      totalAmount,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await order.save();
    await this.cartService.clearCart(userId);

    const phone = this.configService.get<string>('WHATSAPP_PHONE')?.replace(/\D/g, '') || '15551234567';
    const message = encodeURIComponent(
      `Order ID: ${savedOrder._id}\nTotal: $${totalAmount.toFixed(2)}\nView: ${createOrderDto.returnUrl || ''}`,
    );

    return {
      order: savedOrder,
      whatsappUrl: `https://wa.me/${phone}?text=${message}`,
    };
  }

  async getOrders(userId: string, roles: string[]) {
    const filter = roles.includes('admin') ? {} : { user: new Types.ObjectId(userId) };
    return this.orderModel.find(filter).sort({ createdAt: -1 }).populate('items.product').lean().exec();
  }

  async getOrderById(userId: string, id: string, roles: string[]) {
    const order = await this.orderModel
      .findById(id)
      .populate('items.product')
      .lean()
      .exec();

    if (!order) throw new NotFoundException('Order not found');
    if (!roles.includes('admin') && order.user.toString() !== userId) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
}
