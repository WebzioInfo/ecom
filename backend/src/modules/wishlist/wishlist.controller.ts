import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('Wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get customer wishlist items' })
  getWishlist(@Query('customerId') customerId: string) {
    return this.wishlistService.getWishlist(customerId);
  }

  @Post()
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Add product to wishlist (Ignores duplicate entries)' })
  addToWishlist(@Body() dto: AddToWishlistDto) {
    return this.wishlistService.addToWishlist(dto);
  }

  @Delete(':id')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Remove product from wishlist' })
  removeFromWishlist(@Param('id') id: string) {
    return this.wishlistService.removeFromWishlist(id);
  }
}
