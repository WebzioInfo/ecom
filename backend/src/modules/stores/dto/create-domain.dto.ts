import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDomainDto {
  @ApiProperty({ description: 'Domain Name (e.g. shop.nike.com)', example: 'shop.nike.com' })
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiPropertyOptional({ description: 'Is Custom Domain flag', default: true })
  @IsOptional()
  @IsBoolean()
  isCustom?: boolean;

  @ApiPropertyOptional({ description: 'Is Primary Domain flag', default: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
