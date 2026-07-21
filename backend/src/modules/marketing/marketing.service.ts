import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Coupon, CouponDocument, DiscountType } from './schemas/coupon.schema';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';

@Injectable()
export class MarketingService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const existing = await this.couponModel.findOne({
      storeId: new Types.ObjectId(dto.storeId),
      code: dto.code.toUpperCase(),
    });

    if (existing) {
      throw new BadRequestException(`Coupon code '${dto.code}' already exists for this store`);
    }

    const coupon = new this.couponModel({
      ...dto,
      code: dto.code.toUpperCase(),
      storeId: new Types.ObjectId(dto.storeId),
    });
    return coupon.save();
  }

  async findByStore(storeId: string) {
    return this.couponModel
      .find({ storeId: new Types.ObjectId(storeId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async validateCoupon(storeId: string, code: string, cartTotal: number) {
    const coupon = await this.couponModel.findOne({
      storeId: new Types.ObjectId(storeId),
      code: code.toUpperCase(),
      isActive: true,
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
    const coupon = await this.couponModel.findByIdAndUpdate(id, { $set: dto }, { new: true }).exec();
    if (!coupon) throw new NotFoundException(`Coupon #${id} not found`);
    return coupon;
  }

  async remove(id: string): Promise<{ message: string }> {
    const coupon = await this.couponModel.findByIdAndDelete(id).exec();
    if (!coupon) throw new NotFoundException(`Coupon #${id} not found`);
    return { message: `Coupon #${id} deleted successfully` };
  }
}
