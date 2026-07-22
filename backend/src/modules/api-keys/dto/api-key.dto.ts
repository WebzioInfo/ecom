import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsOptional()
  permissions?: string[];

  @IsArray()
  @IsOptional()
  allowedOrigins?: string[];

  @IsNumber()
  @IsOptional()
  rateLimitPerMinute?: number;
}

export class UpdateApiKeyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsOptional()
  permissions?: string[];

  @IsArray()
  @IsOptional()
  allowedOrigins?: string[];
}
