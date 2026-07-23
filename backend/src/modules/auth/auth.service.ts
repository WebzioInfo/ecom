import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { PrismaService, tenantContextStorage } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;
    
    // Check existing User in Tenant Schema
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

    const payload: JwtPayload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.roles?.[0] || 'user',
      tenantId: context.schemaName,
      storeId: context.storeId,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      verificationToken,
    };
  }

  async login(loginDto: LoginDto, clientIp: string = 'unknown', userAgent: string = 'unknown') {
    const { email, password } = loginDto;
    this.logger.log(`Login request received for email: ${email}`);

    // Check Standard User
    const context = tenantContextStorage.getStore();

    if (!context) {
      this.logger.warn(`Login attempt missing store context (x-store-id) for email: ${email}`);
      throw new BadRequestException('Store context required (provide x-store-id header)');
    }

    let user;
    try {
      this.logger.log(`Looking up standard User: ${email} in tenant schema`);
      user = await this.usersService.findByEmail(email);
    } catch (error: any) {
      this.logger.error(`Database connection error during User lookup: ${error.message}`, error.stack);
      throw new InternalServerErrorException('An unexpected error occurred during authentication. Please check database connectivity.');
    }

    if (!user || !user.password) {
      this.logger.warn(`User not found or password not set: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userId = user.id;
    const payload: JwtPayload = { 
      sub: userId, 
      email: user.email, 
      role: user.roles?.[0] || 'user',
      tenantId: context.schemaName,
      storeId: context.storeId
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES', '15m'),
    } as JwtSignOptions);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES', '30d'),
    } as JwtSignOptions);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      user: { id: userId, name: user.name, email: user.email, role: payload.role },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded: any = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const payload = decoded as JwtPayload;

      let validUser = false;
      const user = await this.usersService.findById(payload.sub);
      if (user) validUser = true;

      if (!validUser) {
        throw new UnauthorizedException('User not found or suspended');
      }

      const newPayload: JwtPayload = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
        storeId: payload.storeId,
      };

      return {
        access_token: this.jwtService.sign(newPayload, {
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES', '15m'),
        } as JwtSignOptions),
        token_type: 'Bearer',
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('No account registered with this email');

    const resetToken = randomBytes(24).toString('hex');
    const resetTokenExpiration = new Date(Date.now() + 1000 * 60 * 30);
    await this.usersService.updateProfile(user.id.toString(), {
      resetToken,
      resetTokenExpiration,
    });

    return {
      message: 'Password reset requested. Use the provided token to reset your password.',
      resetToken,
    };
  }

  async resetPassword(token: string, password: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user || !user.resetTokenExpiration || user.resetTokenExpiration < new Date()) {
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
    if (!user) throw new UnauthorizedException('Invalid verification token');

    await this.usersService.updateProfile(user.id.toString(), {
      isVerified: true,
      verificationToken: undefined,
    });
    return { message: 'Email verified successfully' };
  }
}
