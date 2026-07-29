import { IsString, IsNotEmpty, IsEmail, IsOptional, Matches, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProvisionStoreDto {
  @ApiProperty({ description: 'Store Name', example: 'Nike Official Store' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Unique Store Slug', example: 'nike' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be lowercase alphanumeric with hyphens' })
  slug: string;

  @ApiProperty({ description: 'Store Owner Name', example: 'Phil Knight' })
  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @ApiProperty({ description: 'Admin Email', example: 'admin@nike.com' })
  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @ApiProperty({ description: 'Admin Initial Password', example: 'SecureP@ss123' })
  @IsString()
  @MinLength(8)
  adminPassword: string;

  @ApiPropertyOptional({ description: 'SaaS Plan ID (free, starter, business, enterprise)', default: 'starter' })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiPropertyOptional({ description: 'Business Legal Name' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({ description: 'Business Type', default: 'Retail' })
  @IsOptional()
  @IsString()
  businessType?: string;

  @ApiPropertyOptional({ description: 'Currency Code', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Country', default: 'USA' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'City', default: 'Beaverton' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Phone Number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Timezone', default: 'UTC-8 (PST)' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Trial duration in days', default: 14 })
  @IsOptional()
  trialDays?: number;
}
