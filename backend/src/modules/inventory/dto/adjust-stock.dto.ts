import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StockMovementType } from '@prisma/client';

export class AdjustStockDto {
  @ApiProperty({ description: 'Target Product ID' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ description: 'Target Product Variant ID' })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiPropertyOptional({ description: 'Target Warehouse ID (defaults to Main Warehouse)' })
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiProperty({ description: 'Stock Quantity Change (Positive to add, Negative to deduct)', example: 10 })
  @IsNumber()
  quantityDelta: number;

  @ApiPropertyOptional({ enum: StockMovementType, default: StockMovementType.ADJUSTMENT })
  @IsOptional()
  @IsEnum(StockMovementType)
  type?: StockMovementType;

  @ApiPropertyOptional({ description: 'Reason for adjustment', example: 'Stock audit count correction' })
  @IsOptional()
  @IsString()
  reason?: string;
}
