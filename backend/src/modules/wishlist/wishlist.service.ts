import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { CatalogEventService } from '../products/events/catalog-event.service';

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);

  constructor(
    private prisma: PrismaService,
    private eventService: CatalogEventService,
  ) {}

  async addToWishlist(dto: AddToWishlistDto) {
    const product = await this.prisma.tenant.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product || product.isDeleted) {
      throw new NotFoundException(`Product #${dto.productId} not found.`);
    }

    // Ignore duplicate entries gracefully
    const existing = await this.prisma.tenant.wishlist.findFirst({
      where: {
        customerId: dto.customerId,
        productId: dto.productId,
        variantId: dto.variantId || null,
      },
    });

    if (existing) {
      return existing;
    }

    const item = await this.prisma.tenant.wishlist.create({
      data: {
        customerId: dto.customerId,
        productId: dto.productId,
        variantId: dto.variantId || null,
      },
      include: {
        product: { select: { id: true, title: true, slug: true, price: true, offerPrice: true } },
        variant: { select: { id: true, title: true, sku: true, price: true, offerPrice: true } },
      },
    });

    this.eventService.emit('wishlist.updated' as any, { customerId: dto.customerId, action: 'ADD' });

    return item;
  }

  async getWishlist(customerId: string) {
    return this.prisma.tenant.wishlist.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            offerPrice: true,
            media: { take: 1, orderBy: { position: 'asc' } },
          },
        },
        variant: {
          select: {
            id: true,
            title: true,
            sku: true,
            price: true,
            offerPrice: true,
          },
        },
      },
    });
  }

  async removeFromWishlist(id: string) {
    const item = await this.prisma.tenant.wishlist.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Wishlist item #${id} not found.`);

    await this.prisma.tenant.wishlist.delete({ where: { id } });

    this.eventService.emit('wishlist.updated' as any, { customerId: item.customerId, action: 'REMOVE' });

    return { message: 'Item removed from wishlist successfully.' };
  }
}
