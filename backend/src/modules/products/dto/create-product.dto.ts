import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  costPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  offerPrice?: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minStock?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @IsObject()
  @IsOptional()
  dimensions?: any;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsNumber()
  @IsOptional()
  gst?: number;

  @IsNumber()
  @IsOptional()
  tax?: number;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number;

  @IsString()
  @IsOptional()
  seoTitle?: string;

  @IsString()
  @IsOptional()
  seoDescription?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsObject()
  @IsOptional()
  attributes?: any;

  @IsArray()
  @IsOptional()
  variants?: any[];

  @IsString()
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
