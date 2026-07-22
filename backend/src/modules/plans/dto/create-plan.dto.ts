import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class PlanLimitsDto {
  @ApiProperty() @IsNumber() @Min(0) maxProducts: number;
  @ApiProperty() @IsNumber() @Min(0) maxCategories: number;
  @ApiProperty() @IsNumber() @Min(0) maxOrders: number;
  @ApiProperty() @IsNumber() @Min(0) maxCustomers: number;
  @ApiProperty() @IsNumber() @Min(0) maxStaff: number;
  @ApiProperty() @IsNumber() @Min(0) maxWarehouses: number;
  @ApiProperty() @IsNumber() @Min(0) maxStorageMB: number;
  @ApiProperty() @IsNumber() @Min(0) maxApiRequestsPerMonth: number;
  @ApiProperty() @IsNumber() @Min(0) maxIntegrations: number;
}

class PlanFeaturesDto {
  @ApiPropertyOptional() @IsBoolean() @IsOptional() customDomain?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() apiAccess?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() webhooks?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() advancedAnalytics?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() customReports?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() coupons?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() productReviews?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() advancedInventory?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() multiWarehouse?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() marketingTools?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() advancedShipping?: boolean;
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  multiplePaymentGateways?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() staffManagement?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() auditLogs?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() aiFeatures?: boolean;
}

export class CreatePlanDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() code: string;
  @ApiProperty() @IsString() description: string;

  @ApiProperty() @IsNumber() @Min(0) monthlyPrice: number;
  @ApiProperty() @IsNumber() @Min(0) yearlyPrice: number;
  @ApiPropertyOptional() @IsString() @IsOptional() currency?: string;

  @ApiPropertyOptional() @IsNumber() @Min(0) @IsOptional() trialDays?: number;
  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'] })
  @IsEnum(['ACTIVE', 'INACTIVE', 'ARCHIVED'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional() @IsBoolean() @IsOptional() popularBadge?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() recommendedBadge?: boolean;

  @ApiProperty({ type: PlanLimitsDto })
  @ValidateNested()
  @Type(() => PlanLimitsDto)
  limits: PlanLimitsDto;

  @ApiProperty({ type: PlanFeaturesDto })
  @ValidateNested()
  @Type(() => PlanFeaturesDto)
  features: PlanFeaturesDto;

  @ApiPropertyOptional() @IsNumber() @IsOptional() displayOrder?: number;
}
