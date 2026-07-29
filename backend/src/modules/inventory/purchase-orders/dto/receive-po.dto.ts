import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReceivePOItemDto {
  @ApiProperty({ description: 'Purchase Order Item ID' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ description: 'Quantity Received in this shipment', example: 50 })
  @IsNumber()
  @Min(1)
  quantityReceived: number;
}

export class ReceivePurchaseOrderDto {
  @ApiPropertyOptional({ description: 'Target Warehouse ID for stock receipt' })
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiProperty({ type: [ReceivePOItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceivePOItemDto)
  items: ReceivePOItemDto[];
}
