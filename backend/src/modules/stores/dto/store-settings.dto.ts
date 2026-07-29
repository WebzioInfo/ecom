import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStoreSettingsDto {
  @ApiPropertyOptional({ description: 'Legal Business Name' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ description: 'GST / Tax Registration Number' })
  @IsOptional()
  @IsString()
  gstNumber?: string;

  @ApiPropertyOptional({ description: 'Default Currency Code', example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Default Timezone', example: 'America/Los_Angeles' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Default Language', example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Invoice Number Prefix', example: 'INV' })
  @IsOptional()
  @IsString()
  invoicePrefix?: string;

  @ApiPropertyOptional({ description: 'Order Number Prefix', example: 'ORD' })
  @IsOptional()
  @IsString()
  orderPrefix?: string;

  @ApiPropertyOptional({ description: 'Tax Configuration JSON' })
  @IsOptional()
  @IsObject()
  taxConfig?: Record<string, any>;
}
