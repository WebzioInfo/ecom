import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Coupon, DiscountType } from '@prisma/client';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';

@Injectable()
export class MarketingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const existing = await this.prisma.client.coupon.findUnique({
      where: {
        storeId_code: {
          storeId: dto.storeId,
          code: dto.code.toUpperCase(),
        }
      }
    });

    if (existing) {
      throw new BadRequestException(`Coupon code '${dto.code}' already exists for this store`);
    }

    return this.prisma.client.coupon.create({
      data: {
        ...dto,
        type: dto.type as DiscountType,
        code: dto.code.toUpperCase(),
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      } as any
    });
  }

  async findByStore(storeId: string) {
    return this.prisma.client.coupon.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async validateCoupon(storeId: string, code: string, cartTotal: number) {
    const coupon = await this.prisma.client.coupon.findFirst({
      where: {
        storeId,
        code: code.toUpperCase(),
        isActive: true,
      }
    });

    if (!coupon) {
      throw new NotFoundException('Invalid or expired coupon code');
    }

    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      throw new BadRequestException('Coupon code has expired');
    }

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (cartTotal < coupon.minOrderAmount) {
      throw new BadRequestException(`Minimum order amount of $${coupon.minOrderAmount} required`);
    }

    let discountAmount = 0;
    if (coupon.type === DiscountType.PERCENTAGE) {
      discountAmount = (cartTotal * coupon.value) / 100;
    } else if (coupon.type === DiscountType.FIXED_AMOUNT) {
      discountAmount = Math.min(coupon.value, cartTotal);
    }

    return {
      valid: true,
      code: coupon.code,
      type: coupon.type,
      discountAmount,
      finalTotal: cartTotal - discountAmount,
    };
  }

  async update(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    try {
      return await this.prisma.client.coupon.update({
        where: { id },
        data: dto as any
      });
    } catch {
      throw new NotFoundException(`Coupon #${id} not found`);
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      await this.prisma.client.coupon.delete({ where: { id } });
      return { message: `Coupon #${id} deleted successfully` };
    } catch {
      throw new NotFoundException(`Coupon #${id} not found`);
    }
  }
}
