import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransferStockDto {
  @ApiProperty({ description: 'Product ID to transfer' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ description: 'Variant ID to transfer' })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ description: 'Source Warehouse ID' })
  @IsString()
  @IsNotEmpty()
  fromWarehouseId: string;

  @ApiProperty({ description: 'Destination Warehouse ID' })
  @IsString()
  @IsNotEmpty()
  toWarehouseId: string;

  @ApiProperty({ description: 'Quantity to transfer', example: 5 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Transfer Reason / Order Number' })
  @IsOptional()
  @IsString()
  reason?: string;
}
