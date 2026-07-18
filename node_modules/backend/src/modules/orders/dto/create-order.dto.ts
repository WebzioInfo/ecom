import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsMongoId()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  priceAtPurchase: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNotEmpty()
  customerName: string;

  @IsNotEmpty()
  shippingAddress: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  paymentMethod: string;

  @IsNotEmpty()
  returnUrl: string;
}
