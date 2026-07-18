import { IsMongoId } from 'class-validator';

export class WishlistDto {
  @IsMongoId()
  productId: string;
}
