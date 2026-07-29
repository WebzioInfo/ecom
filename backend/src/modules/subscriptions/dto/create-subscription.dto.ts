import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  HALF_YEARLY = 'HALF_YEARLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM',
}

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Target Store ID' })
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @ApiProperty({ description: 'SaaS Plan ID / Code', example: 'starter' })
  @IsString()
  @IsNotEmpty()
  planId: string;

  @ApiPropertyOptional({ enum: BillingCycle, default: BillingCycle.MONTHLY })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @ApiPropertyOptional({ description: 'Start with free trial period', default: true })
  @IsOptional()
  @IsBoolean()
  startTrial?: boolean;

  @ApiPropertyOptional({ description: 'Trial duration in days', default: 14 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  trialDays?: number;
}
