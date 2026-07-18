import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

  async getCart(userId: string) {
    const cart = await this.cartModel
      .findOne({ user: userId })
      .populate('items.product')
      .lean()
      .exec();
    return cart || { user: userId, items: [] };
  }

  async addToCart(userId: string, productId: string, quantity = 1) {
    return this.cartModel
      .findOneAndUpdate(
        { user: userId },
        {
          $setOnInsert: { user: userId },
          $inc: { 'items.$[item].quantity': quantity },
          $push: {
            items: {
              $each: [{ product: new Types.ObjectId(productId), quantity }],
              $slice: 0,
            },
          },
        },
        {
          new: true,
          upsert: true,
          arrayFilters: [{ 'item.product': new Types.ObjectId(productId) }],
        },
      )
      .exec();
  }

  async updateCartItem(userId: string, productId: string, quantity: number) {
    if (quantity < 1) {
      return this.removeItem(userId, productId);
    }

    const cart = await this.cartModel
      .findOneAndUpdate(
        { user: userId, 'items.product': new Types.ObjectId(productId) },
        { $set: { 'items.$.quantity': quantity } },
        { new: true },
      )
      .exec();

    if (!cart) {
      throw new NotFoundException('Cart item not found');
    }

    return cart;
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.cartModel
      .findOneAndUpdate(
        { user: userId },
        { $pull: { items: { product: new Types.ObjectId(productId) } } },
        { new: true },
      )
      .exec();

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return cart;
  }

  async clearCart(userId: string) {
    return this.cartModel
      .findOneAndUpdate({ user: userId }, { items: [] }, { new: true })
      .exec();
  }
}
