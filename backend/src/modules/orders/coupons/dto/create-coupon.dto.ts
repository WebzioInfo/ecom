import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';

export class CreateCouponDto {
  @ApiProperty({ description: 'Unique Coupon Code', example: 'SUMMER20' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9_-]+$/, { message: 'Coupon code must be uppercase alphanumeric' })
  code: string;

  @ApiPropertyOptional({ enum: DiscountType, default: DiscountType.PERCENTAGE })
  @IsOptional()
  @IsEnum(DiscountType)
  type?: DiscountType;

  @ApiProperty({ description: 'Discount value (Percentage or Amount)', example: 20 })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ description: 'Minimum order amount to apply coupon', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ description: 'Maximum usages allowed (0 for unlimited)', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxUses?: number;

  @ApiPropertyOptional({ description: 'Coupon Start Date' })
  @IsOptional()
  @IsString()
  startsAt?: string;

  @ApiPropertyOptional({ description: 'Coupon Expiry Date' })
  @IsOptional()
  @IsString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Active Status', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
