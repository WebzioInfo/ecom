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
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { WishlistDto } from './dto/wishlist.dto';

interface AuthRequest {
  user: {
    userId: string;
    roles: string[];
  };
}

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req: AuthRequest) {
    return this.usersService.findById(req.user.userId);
  }

  @Patch('profile')
  async updateProfile(
    @Request() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(req.user.userId, updateUserDto);
  }

  @Get('wishlist')
  async getWishlist(@Request() req: AuthRequest) {
    return this.usersService.getWishlist(req.user.userId);
  }

  @Post('wishlist')
  async addToWishlist(
    @Request() req: AuthRequest,
    @Body() wishlistDto: WishlistDto,
  ) {
    return this.usersService.addToWishlist(
      req.user.userId,
      wishlistDto.productId,
    );
  }

  @Delete('wishlist/:productId')
  async removeFromWishlist(
    @Request() req: AuthRequest,
    @Param('productId') productId: string,
  ) {
    return this.usersService.removeFromWishlist(req.user.userId, productId);
  }
}
