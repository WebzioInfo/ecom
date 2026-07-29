import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStoreBrandingDto {
  @ApiPropertyOptional({ description: 'Store Logo URL' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ description: 'Store Favicon URL' })
  @IsOptional()
  @IsString()
  favicon?: string;

  @ApiPropertyOptional({ description: 'Primary Theme Color Hex', example: '#FF0000' })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional({ description: 'Secondary Theme Color Hex', example: '#000000' })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiPropertyOptional({ description: 'Theme Name', default: 'modern-dark' })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiPropertyOptional({ description: 'Store Hero Banner URL' })
  @IsOptional()
  @IsString()
  storeBanner?: string;
}
