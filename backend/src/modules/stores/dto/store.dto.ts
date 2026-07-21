import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsObject } from 'class-validator';
import { StoreStatus } from '../schemas/store.schema';

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
  subscription?: any;

  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsObject()
  @IsOptional()
  branding?: any;

  @IsObject()
  @IsOptional()
  settings?: any;
}

export class UpdateStoreDto {
  @IsString()
  @IsOptional()
  name?: string;

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
  subscription?: any;

  @IsObject()
  @IsOptional()
  branding?: any;

  @IsObject()
  @IsOptional()
  settings?: any;
}
