import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { DiscountType } from '@prisma/client';

@Injectable()
export class CouponsService {
  private readonly logger = new Logger(CouponsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCouponDto, userId?: string) {
    const existing = await this.prisma.tenant.coupon.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Coupon code '${dto.code}' already exists.`);
    }

    const coupon = await this.prisma.tenant.coupon.create({
      data: {
        code: dto.code,
        type: dto.type || DiscountType.PERCENTAGE,
        value: dto.value,
        minOrderAmount: dto.minOrderAmount ?? 0,
        maxUses: dto.maxUses ?? 0,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        isActive: dto.isActive ?? true,
      },
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'COUPON_CREATE',
            entity: 'Coupon',
            entityId: coupon.id,
            changes: { code: coupon.code, value: coupon.value } as any,
          },
        });
      } catch {}
    }

    return coupon;
  }

  async findAll() {
    return this.prisma.tenant.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const coupon = await this.prisma.tenant.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException(`Coupon #${id} not found.`);
    return coupon;
  }

  async findByCode(code: string) {
    const coupon = await this.prisma.tenant.coupon.findUnique({ where: { code } });
    if (!coupon) throw new NotFoundException(`Coupon code '${code}' not found.`);
    return coupon;
  }

  async validateAndCalculateDiscount(code: string, subtotal: number) {
    const coupon = await this.findByCode(code);
    const now = new Date();

    if (!coupon.isActive) {
      throw new BadRequestException(`Coupon '${code}' is inactive.`);
    }

    if (coupon.startsAt && now < coupon.startsAt) {
      throw new BadRequestException(`Coupon '${code}' is not active yet.`);
    }

    if (coupon.expiresAt && now > coupon.expiresAt) {
      throw new BadRequestException(`Coupon '${code}' has expired.`);
    }

    if (subtotal < coupon.minOrderAmount) {
      throw new BadRequestException(
        `Subtotal ($${subtotal}) does not meet minimum order amount ($${coupon.minOrderAmount}) for coupon '${code}'.`,
      );
    }

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException(`Coupon '${code}' has reached its maximum usage limit.`);
    }

    let discountAmount = 0;
    if (coupon.type === DiscountType.PERCENTAGE) {
      discountAmount = (subtotal * coupon.value) / 100;
    } else if (coupon.type === DiscountType.FIXED_AMOUNT) {
      discountAmount = Math.min(subtotal, coupon.value);
    }

    return {
      coupon,
      discountAmount: Number(discountAmount.toFixed(2)),
    };
  }

  async update(id: string, dto: UpdateCouponDto, userId?: string) {
    const coupon = await this.findOne(id);

    if (dto.code && dto.code !== coupon.code) {
      const existing = await this.prisma.tenant.coupon.findUnique({
        where: { code: dto.code },
      });
      if (existing) {
        throw new ConflictException(`Coupon code '${dto.code}' already exists.`);
      }
    }

    const updated = await this.prisma.tenant.coupon.update({
      where: { id },
      data: {
        ...dto,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      } as any,
    });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'COUPON_UPDATE',
            entity: 'Coupon',
            entityId: id,
            changes: dto as any,
          },
        });
      } catch {}
    }

    return updated;
  }

  async remove(id: string, userId?: string) {
    await this.findOne(id);
    const deleted = await this.prisma.tenant.coupon.delete({ where: { id } });

    if (userId) {
      try {
        await this.prisma.tenant.auditLog.create({
          data: {
            userId,
            action: 'COUPON_DELETE',
            entity: 'Coupon',
            entityId: id,
            changes: { code: deleted.code } as any,
          },
        });
      } catch {}
    }

    return { message: `Coupon #${id} deleted successfully.` };
  }
}
