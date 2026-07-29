import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingCycle } from './create-subscription.dto';

export class UpgradeSubscriptionDto {
  @ApiProperty({ description: 'New Target Plan ID / Code', example: 'business' })
  @IsString()
  @IsNotEmpty()
  newPlanId: string;

  @ApiPropertyOptional({ enum: BillingCycle })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;
}
