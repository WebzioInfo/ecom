import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BillingCycle } from './create-subscription.dto';

export class RenewSubscriptionDto {
  @ApiPropertyOptional({ enum: BillingCycle })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @ApiPropertyOptional({ description: 'Payment Method (MANUAL, CARD, BANK_TRANSFER)', default: 'MANUAL' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
