import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
} from 'class-validator';
import {  StoreStatus  } from '@prisma/public-client';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  domain?: string;

  @IsString()
  @IsOptional()
  customDomain?: string;

  @IsObject()
  @IsOptional()
  subscription?: Record<string, unknown>;

  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsObject()
  @IsOptional()
  branding?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  settings?: Record<string, unknown>;
}

export class UpdateStoreDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  adminEmail?: string;

  @IsString()
  @IsOptional()
  domain?: string;

  @IsString()
  @IsOptional()
  customDomain?: string;

  @IsEnum(StoreStatus)
  @IsOptional()
  status?: StoreStatus;

  @IsObject()
  @IsOptional()
  subscription?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  branding?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  settings?: Record<string, unknown>;
}
