import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService, tenantContextStorage } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;
    const context = tenantContextStorage.getStore();

    if (!context) {
      throw new BadRequestException('Store context required (provide x-store-id header)');
    }

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const verificationToken = randomBytes(24).toString('hex');

    const newUser = await this.usersService.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
    });

    // Create a global UserRegistry mapping
    await this.prisma.public.userRegistry.upsert({
      where: {
        email_storeId: { email, storeId: context.storeId }
      },
      update: {
        schema: context.schemaName,
      },
      create: {
        email,
        storeId: context.storeId,
        schema: context.schemaName,
      }
    });

    const payload = {
      sub: newUser.id,
      email: newUser.email,
      roles: newUser.roles,
      storeId: context.storeId,
    };
    return {
      access_token: this.jwtService.sign(payload),
      verificationToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const context = tenantContextStorage.getStore();

    if (!context) {
      throw new BadRequestException('Store context required (provide x-store-id header)');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      sub: user.id, 
      email: user.email, 
      roles: user.roles,
      storeId: context.storeId,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('No account registered with this email');
    }

    const resetToken = randomBytes(24).toString('hex');
    const resetTokenExpiration = new Date(Date.now() + 1000 * 60 * 30);
    await this.usersService.updateProfile(user.id.toString(), {
      resetToken,
      resetTokenExpiration,
    });

    return {
      message:
        'Password reset requested. Use the provided token to reset your password.',
      resetToken,
    };
  }

  async resetPassword(token: string, password: string) {
    const user = await this.usersService.findByResetToken(token);
    if (
      !user ||
      !user.resetTokenExpiration ||
      user.resetTokenExpiration < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.usersService.updateProfile(user.id.toString(), {
      password: hashedPassword,
      resetToken: undefined,
      resetTokenExpiration: undefined,
    });

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid verification token');
    }

    await this.usersService.updateProfile(user.id.toString(), {
      isVerified: true,
      verificationToken: undefined,
    });
    return { message: 'Email verified successfully' };
  }
}
