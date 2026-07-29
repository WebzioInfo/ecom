import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import { CatalogEventService } from '../products/events/catalog-event.service';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    private prisma: PrismaService,
    private eventService: CatalogEventService,
  ) {}

  private async getOrCreateCart(customerId?: string, sessionToken?: string) {
    if (!customerId && !sessionToken) {
      throw new BadRequestException('Either customerId or sessionToken must be provided.');
    }

    const where: any = customerId ? { customerId } : { sessionToken };

    let cart = await this.prisma.tenant.cart.findUnique({
      where,
      include: {
        items: {
          include: {
            product: { select: { id: true, title: true, slug: true, status: true, isDeleted: true, isActive: true } },
            variant: { select: { id: true, title: true, sku: true, isActive: true } },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.tenant.cart.create({
        data: { customerId, sessionToken },
        include: {
          items: {
            include: {
              product: { select: { id: true, title: true, slug: true, status: true, isDeleted: true, isActive: true } },
              variant: { select: { id: true, title: true, sku: true, isActive: true } },
            },
          },
        },
      });
    }

    return cart;
  }

  async getCart(customerId?: string, sessionToken?: string) {
    const cart = await this.getOrCreateCart(customerId, sessionToken);
    
    // Calculate totals dynamically
    const items = cart.items.map((item) => ({
      ...item,
      lineTotal: item.quantity * item.unitPrice,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      cartId: cart.id,
      customerId: cart.customerId,
      sessionToken: cart.sessionToken,
      items,
      totalItems,
      totalAmount,
    };
  }

  async addItem(dto: AddToCartDto) {
    const cart = await this.getOrCreateCart(dto.customerId, dto.sessionToken);

    // 1. Validate Product Status & Availability
    const product = await this.prisma.tenant.product.findUnique({
      where: { id: dto.productId },
    });

    if (
      !product ||
      product.isDeleted ||
      !product.isActive ||
      product.status !== ProductStatus.PUBLISHED
    ) {
      throw new BadRequestException(`Product #${dto.productId} is inactive, archived, or not available for purchase.`);
    }

    let variant = null;
    let availableStock = product.stock;

    if (dto.variantId) {
      variant = await this.prisma.tenant.productVariant.findUnique({
        where: { id: dto.variantId },
      });

      if (!variant || !variant.isActive) {
        throw new BadRequestException(`Product Variant #${dto.variantId} is not active or available.`);
      }

      availableStock = variant.stock;
    }

    // 2. Check Existing Cart Item Quantity & Validate Stock Bounds
    const existingItem = cart.items.find(
      (i) => i.productId === dto.productId && i.variantId === (dto.variantId || null),
    );

    const currentCartQty = existingItem ? existingItem.quantity : 0;
    const requestedQty = currentCartQty + dto.quantity;

    if (requestedQty > availableStock) {
      throw new BadRequestException(
        `Requested quantity (${requestedQty}) exceeds available stock (${availableStock}) for '${product.title}'.`,
      );
    }

    const unitPrice = variant
      ? (variant.offerPrice ?? variant.price)
      : (product.offerPrice ?? product.price);

    // 3. Add or Update Cart Item
    if (existingItem) {
      await this.prisma.tenant.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: requestedQty, unitPrice },
      });
    } else {
      await this.prisma.tenant.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          variantId: dto.variantId || null,
          quantity: dto.quantity,
          unitPrice,
        },
      });
    }

    // Emit Domain Event
    this.eventService.emit('cart.updated' as any, { cartId: cart.id, action: 'ADD_ITEM' });

    return this.getCart(dto.customerId, dto.sessionToken);
  }

  async updateItem(itemId: string, dto: UpdateCartItemDto) {
    const item = await this.prisma.tenant.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true, variant: true },
    });

    if (!item) throw new NotFoundException(`Cart item #${itemId} not found.`);

    const availableStock = item.variant ? item.variant.stock : item.product.stock;
    if (dto.quantity > availableStock) {
      throw new BadRequestException(
        `Requested quantity (${dto.quantity}) exceeds available stock (${availableStock}).`,
      );
    }

    await this.prisma.tenant.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    this.eventService.emit('cart.updated' as any, { cartId: item.cartId, action: 'UPDATE_ITEM' });

    return { message: 'Cart item updated successfully.' };
  }

  async removeItem(itemId: string) {
    const item = await this.prisma.tenant.cartItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException(`Cart item #${itemId} not found.`);

    await this.prisma.tenant.cartItem.delete({ where: { id: itemId } });

    this.eventService.emit('cart.updated' as any, { cartId: item.cartId, action: 'REMOVE_ITEM' });

    return { message: 'Cart item removed successfully.' };
  }

  async clearCart(customerId?: string, sessionToken?: string) {
    const cart = await this.getOrCreateCart(customerId, sessionToken);

    await this.prisma.tenant.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    this.eventService.emit('cart.updated' as any, { cartId: cart.id, action: 'CLEAR' });

    return { message: 'Cart cleared successfully.' };
  }

  async mergeCart(dto: MergeCartDto) {
    const guestCart = await this.prisma.tenant.cart.findUnique({
      where: { sessionToken: dto.sessionToken },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return this.getCart(dto.customerId);
    }

    const customerCart = await this.getOrCreateCart(dto.customerId);

    for (const guestItem of guestCart.items) {
      await this.addItem({
        customerId: dto.customerId,
        productId: guestItem.productId,
        variantId: guestItem.variantId || undefined,
        quantity: guestItem.quantity,
      });
    }

    // Delete Guest Cart post-merge
    await this.prisma.tenant.cart.delete({ where: { id: guestCart.id } });

    this.eventService.emit('cart.updated' as any, { cartId: customerCart.id, action: 'MERGE' });

    return this.getCart(dto.customerId);
  }
}
