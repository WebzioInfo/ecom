import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShipmentDto {
  @ApiProperty({ description: 'Target Order ID' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiPropertyOptional({ description: 'Courier Partner Name', example: 'FedEx' })
  @IsOptional()
  @IsString()
  courier?: string;

  @ApiPropertyOptional({ description: 'External Courier Tracking Number' })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({ description: 'Public Tracking URL' })
  @IsOptional()
  @IsString()
  trackingUrl?: string;
}
