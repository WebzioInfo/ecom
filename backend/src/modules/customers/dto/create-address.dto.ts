import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressType } from '@prisma/client';

export class CreateCustomerAddressDto {
  @ApiPropertyOptional({ enum: AddressType, default: AddressType.SHIPPING })
  @IsOptional()
  @IsEnum(AddressType)
  type?: AddressType;

  @ApiProperty({ description: 'First Name', example: 'Jane' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last Name', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ description: 'Company Name' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ description: 'Address Line 1', example: '123 Market St' })
  @IsString()
  @IsNotEmpty()
  address1: string;

  @ApiPropertyOptional({ description: 'Address Line 2 (Apt, Suite)' })
  @IsOptional()
  @IsString()
  address2?: string;

  @ApiProperty({ description: 'City', example: 'San Francisco' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State / Province', example: 'CA' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Postal / Zip Code', example: '94105' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ description: 'Country', example: 'USA' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({ description: 'Phone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Set as default address for this address type', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
