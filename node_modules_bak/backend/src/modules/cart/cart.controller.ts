import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

interface AuthRequest {
  user: {
    userId: string;
    roles: string[];
  };
}

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req: AuthRequest) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post()
  async addToCart(
    @Request() req: AuthRequest,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addToCart(
      req.user.userId,
      addToCartDto.productId,
      addToCartDto.quantity,
    );
  }

  @Patch()
  async updateCart(
    @Request() req: AuthRequest,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(
      req.user.userId,
      updateCartItemDto.productId,
      updateCartItemDto.quantity,
    );
  }

  @Delete(':productId')
  async removeItem(
    @Request() req: AuthRequest,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(req.user.userId, productId);
  }
}
