import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/public-client';
import { User } from '@prisma/public-client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.public.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.public.user.findUnique({ where: { id } });
  }

  async create(userData: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.public.user.create({ data: userData });
  }

  async updateProfile(id: string, updateUserDto: Prisma.UserUpdateInput): Promise<User> {
    try {
      return await this.prisma.public.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.prisma.public.user.findFirst({ where: { resetToken: token } });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.prisma.public.user.findFirst({ where: { verificationToken: token } });
  }

  async getWishlist(userId: string) {
    const user = await this.prisma.public.user.findUnique({
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
    const user = await this.prisma.public.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    const wishlist = new Set(user.wishlist);
    wishlist.add(productId);
    
    const updated = await this.prisma.public.user.update({
      where: { id: userId },
      data: { wishlist: Array.from(wishlist) }
    });
    
    return updated.wishlist;
  }

  async removeFromWishlist(userId: string, productId: string) {
    const user = await this.prisma.public.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    const wishlist = user.wishlist.filter((id: any) => id !== productId);
    
    const updated = await this.prisma.public.user.update({
      where: { id: userId },
      data: { wishlist }
    });
    
    return updated.wishlist;
  }

  async getStoreStaff(storeId: string) {
    const registries = await this.prisma.public.userRegistry.findMany({
      where: { storeId },
    });
    const emails = registries.map((r: any) => r.email);
    const users = await this.prisma.public.user.findMany({
      where: { email: { in: emails } },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return users.map((u: any) => ({
      ...u,
      role: u.roles?.[0] || 'STORE_EMPLOYEE',
      status: u.isVerified ? 'ACTIVE' : 'ACTIVE',
    }));
  }

  async addStoreStaff(storeId: string, schema: string, dto: any) {
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(dto.password || 'Password123!', 10);
    const roles = Array.isArray(dto.roles) ? dto.roles : [dto.role || 'STORE_EMPLOYEE'];

    let user = await this.prisma.public.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      user = await this.prisma.public.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          roles: roles as any,
          isVerified: true,
        },
      });
    }

    try {
      await this.prisma.public.userRegistry.create({
        data: {
          email: dto.email,
          storeId,
          schema: schema || `tenant_${storeId}`,
        },
      });
    } catch {
      // User registry entry already exists
    }

    return user;
  }

  async updateStoreStaff(userId: string, dto: any) {
    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.role) updateData.roles = [dto.role];
    if (dto.roles) updateData.roles = dto.roles;

    return this.prisma.public.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  async resetStaffPassword(userId: string, newPassword?: string) {
    const bcrypt = await import('bcrypt');
    const pass = newPassword || `Pass!${Math.random().toString(36).slice(-8)}`;
    const hashedPassword = await bcrypt.hash(pass, 10);

    await this.prisma.public.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true, temporaryPassword: pass };
  }

  async deleteStoreStaff(storeId: string, userId: string) {
    const user = await this.prisma.public.user.findUnique({ where: { id: userId } });
    if (user) {
      await this.prisma.public.userRegistry.deleteMany({
        where: { storeId, email: user.email },
      });
    }
    return { success: true };
  }
}
