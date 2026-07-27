import { IsNotEmpty, IsString } from 'class-validator';

export class WishlistDto {
  @IsString()
  @IsNotEmpty()
  productId: string;
}
