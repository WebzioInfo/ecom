import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBillingRecordDto {
  @ApiProperty({ description: 'Target Store ID' })
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @ApiPropertyOptional({ description: 'Target Subscription ID' })
  @IsOptional()
  @IsString()
  subscriptionId?: string;

  @ApiProperty({ description: 'Plan Code / Name', example: 'starter' })
  @IsString()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({ description: 'Billing Period (e.g. 2026-07)', example: '2026-07' })
  @IsString()
  @IsNotEmpty()
  billingPeriod: string;

  @ApiProperty({ description: 'Base Amount', example: 99.00 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Discount Amount', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ description: 'Tax Amount', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiPropertyOptional({ description: 'Payment Method (MANUAL, CARD, BANK_TRANSFER)', default: 'MANUAL' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'External Payment Reference Number' })
  @IsOptional()
  @IsString()
  referenceNumber?: string;
}
