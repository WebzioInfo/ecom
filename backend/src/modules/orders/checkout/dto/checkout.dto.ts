import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsEmail, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutAddressDto {
  @ApiProperty({ example: 'Jane' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  address1: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address2?: string;

  @ApiProperty({ example: 'San Francisco' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'CA' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '94105' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ example: 'USA' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({ example: '+1 555-123-4567' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CheckoutDto {
  @ApiPropertyOptional({ description: 'Customer ID (if logged in)' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Guest Session Token (if guest checkout)' })
  @IsOptional()
  @IsString()
  sessionToken?: string;

  @ApiPropertyOptional({ description: 'Guest Email (if guest checkout)' })
  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @ApiPropertyOptional({ description: 'Saved Shipping Address ID' })
  @IsOptional()
  @IsString()
  shippingAddressId?: string;

  @ApiPropertyOptional({ type: CheckoutAddressDto })
  @IsOptional()
  @IsObject()
  shippingAddress?: CheckoutAddressDto;

  @ApiPropertyOptional({ description: 'Saved Billing Address ID' })
  @IsOptional()
  @IsString()
  billingAddressId?: string;

  @ApiPropertyOptional({ type: CheckoutAddressDto })
  @IsOptional()
  @IsObject()
  billingAddress?: CheckoutAddressDto;

  @ApiPropertyOptional({ description: 'Coupon Code' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ description: 'Tax Rate Percentage (e.g. 8.5 for 8.5%)', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiPropertyOptional({ description: 'Order Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
