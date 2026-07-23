import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cart, Prisma } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const cart = await this.prisma.client.cart.findUnique({
      where: { userId },
    });
    
    if (!cart) {
      return { user: userId, items: [] };
    }
    
    // items is a JSON array: [{ product: productId, quantity: number }]
    // we should populate it by fetching the products
    const items = cart.items as any[];
    if (items && items.length > 0) {
      const productIds = items.map(i => i.product);
      const products = await this.prisma.client.product.findMany({
        where: { id: { in: productIds } }
      });
      
      const populatedItems = items.map(item => ({
        ...item,
        product: products.find((p: any) => p.id === item.product) || item.product
      }));
      
      return { ...cart, items: populatedItems };
    }
    
    return cart;
  }

  async addToCart(userId: string, productId: string, quantity = 1) {
    const cart = await this.prisma.client.cart.findUnique({ where: { userId } });
    
    let items: any[] = [];
    if (cart && Array.isArray(cart.items)) {
      items = cart.items;
      const existingItem = items.find(i => i.product === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        items.push({ product: productId, quantity });
      }
    } else {
      items = [{ product: productId, quantity }];
    }
    
    return this.prisma.client.cart.upsert({
      where: { userId },
      update: { items },
      create: { userId, items }
    });
  }

  async updateCartItem(userId: string, productId: string, quantity: number) {
    if (quantity < 1) {
      return this.removeItem(userId, productId);
    }

    const cart = await this.prisma.client.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');
    
    let items = (cart.items as any[]) || [];
    const item = items.find(i => i.product === productId);
    
    if (!item) throw new NotFoundException('Cart item not found');
    item.quantity = quantity;

    return this.prisma.client.cart.update({
      where: { userId },
      data: { items }
    });
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.prisma.client.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');
    
    let items = (cart.items as any[]) || [];
    items = items.filter(i => i.product !== productId);

    return this.prisma.client.cart.update({
      where: { userId },
      data: { items }
    });
  }

  async clearCart(userId: string) {
    return this.prisma.client.cart.upsert({
      where: { userId },
      update: { items: [] },
      create: { userId, items: [] }
    });
  }
}
