import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { DiscountType } from '../schemas/coupon.schema';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(DiscountType)
  @IsOptional()
  type?: DiscountType;

  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsNumber()
  @IsOptional()
  minOrderAmount?: number;

  @IsNumber()
  @IsOptional()
  maxUses?: number;

  @IsDateString()
  @IsOptional()
  startsAt?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}

export class UpdateCouponDto {
  @IsEnum(DiscountType)
  @IsOptional()
  type?: DiscountType;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsNumber()
  @IsOptional()
  minOrderAmount?: number;

  @IsNumber()
  @IsOptional()
  maxUses?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
