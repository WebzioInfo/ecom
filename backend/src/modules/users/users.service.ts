import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.client.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.client.user.findUnique({ where: { id } });
  }

  async create(userData: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.client.user.create({ data: userData });
  }

  async updateProfile(id: string, updateUserDto: Prisma.UserUpdateInput): Promise<User> {
    try {
      return await this.prisma.client.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.prisma.client.user.findFirst({ where: { resetToken: token } });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.prisma.client.user.findFirst({ where: { verificationToken: token } });
  }

  async getWishlist(userId: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { wishlist: true },
    });
    if (!user) throw new NotFoundException('User not found');
    
    // In Prisma, we stored wishlist as a string array of Product IDs. 
    // To match Mongoose's populate('wishlist'), we'd fetch the products here.
    const products = await this.prisma.client.product.findMany({
      where: { id: { in: user.wishlist } }
    });
    return products;
  }

  async addToWishlist(userId: string, productId: string) {
    const user = await this.prisma.client.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    const wishlist = new Set(user.wishlist);
    wishlist.add(productId);
    
    const updated = await this.prisma.client.user.update({
      where: { id: userId },
      data: { wishlist: Array.from(wishlist) }
    });
    
    return updated.wishlist;
  }

  async removeFromWishlist(userId: string, productId: string) {
    const user = await this.prisma.client.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    const wishlist = user.wishlist.filter((id: any) => id !== productId);
    
    const updated = await this.prisma.client.user.update({
      where: { id: userId },
      data: { wishlist }
    });
    
    return updated.wishlist;
  }
}
