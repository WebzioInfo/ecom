import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsNumber,
  IsEnum,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StoreStatus } from '@prisma/public-client';

export class ProvisionStoreDto {
  // Store Basic Details
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  businessName?: string;

  @IsString()
  @IsOptional()
  businessType?: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  website?: string;

  // Owner & Admin Credentials
  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @IsEmail()
  @IsNotEmpty()
  ownerEmail: string;

  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @IsString()
  @MinLength(6)
  adminPassword: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  altPhone?: string;

  // Location & Contact
  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  language?: string;

  // Tax & Business Reg
  @IsString()
  @IsOptional()
  gstNumber?: string;

  @IsString()
  @IsOptional()
  taxNumber?: string;

  // Subscription Details
  @IsString()
  @IsOptional()
  planId?: string;

  @IsString()
  @IsOptional()
  subscriptionType?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Trial days must be a number.' })
  @IsOptional()
  trialDays?: number;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  expiryDate?: string;

  @IsEnum(StoreStatus)
  @IsOptional()
  status?: StoreStatus;
}
