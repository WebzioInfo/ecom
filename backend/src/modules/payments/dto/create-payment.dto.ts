import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Target Order ID' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: 'Payment Gateway (COD, MANUAL, STRIPE, RAZORPAY)', example: 'COD' })
  @IsString()
  @IsNotEmpty()
  gateway: string;

  @ApiProperty({ description: 'Payment Amount', example: 129.99 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency Code', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'External Transaction ID / Ref Number' })
  @IsOptional()
  @IsString()
  transactionId?: string;
}
