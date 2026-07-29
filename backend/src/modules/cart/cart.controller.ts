import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('Shopping Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'View cart details by customerId or sessionToken' })
  getCart(
    @Query('customerId') customerId?: string,
    @Query('sessionToken') sessionToken?: string,
  ) {
    return this.cartService.getCart(customerId, sessionToken);
  }

  @Post('items')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Add item to cart (Validates active product status and available stock)' })
  addItem(@Body() dto: AddToCartDto) {
    return this.cartService.addItem(dto);
  }

  @Patch('items/:itemId')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(itemId, dto);
  }

  @Delete('items/:itemId')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(@Param('itemId') itemId: string) {
    return this.cartService.removeItem(itemId);
  }

  @Post('clear')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Clear all cart items' })
  clearCart(
    @Query('customerId') customerId?: string,
    @Query('sessionToken') sessionToken?: string,
  ) {
    return this.cartService.clearCart(customerId, sessionToken);
  }

  @Post('merge')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Merge guest session cart into customer account post-login' })
  mergeCart(@Body() dto: MergeCartDto) {
    return this.cartService.mergeCart(dto);
  }
}
