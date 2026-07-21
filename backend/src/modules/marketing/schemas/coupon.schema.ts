import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CouponDocument = Coupon & Document;

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
}

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ type: Types.ObjectId, ref: 'Store', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ required: true, uppercase: true, index: true })
  code: string;

  @Prop({ type: String, enum: DiscountType, default: DiscountType.PERCENTAGE })
  type: DiscountType;

  @Prop({ required: true, min: 0 })
  value: number;

  @Prop({ default: 0 })
  minOrderAmount: number;

  @Prop({ default: 0 })
  maxUses: number; // 0 = unlimited

  @Prop({ default: 0 })
  usedCount: number;

  @Prop()
  startsAt?: Date;

  @Prop()
  expiresAt?: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
CouponSchema.index({ storeId: 1, code: 1 }, { unique: true });
