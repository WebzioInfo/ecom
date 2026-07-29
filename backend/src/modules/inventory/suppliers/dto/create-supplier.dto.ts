import { IsString, IsNotEmpty, IsOptional, IsBoolean, Matches, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ description: 'Supplier Name', example: 'Acme Supply Co.' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Unique Supplier Code', example: 'SUP-ACME-01' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9_-]+$/, { message: 'Supplier code must be uppercase alphanumeric' })
  code: string;

  @ApiPropertyOptional({ description: 'Contact Person Name', example: 'John Doe' })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ description: 'Contact Email', example: 'contact@acmesupply.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Contact Phone', example: '+1 555-987-6543' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Address Details' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Active Status', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
