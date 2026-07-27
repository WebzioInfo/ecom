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

    const payload: JwtPayload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.roles?.[0] || 'user',
      tenantId: 'platform', // Default platform tenant context initially
      storeId: '',
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      verificationToken,
    };
  }

  private getRoleMetadata(role: string) {
    let permissions: string[] = [];
    let accessibleModules: string[] = [];
    const isSuperAdmin = role === 'SUPER_ADMIN';

    if (role === 'SUPER_ADMIN') {
      permissions = ['*'];
      accessibleModules = ['dashboard', 'stores', 'plans', 'support', 'system', 'audit-logs', 'developer', 'users', 'settings'];
    } else if (role === 'STORE_OWNER' || role === 'ADMIN') {
      permissions = ['store:*'];
      accessibleModules = ['dashboard', 'products', 'orders', 'inventory', 'customers', 'marketing', 'support', 'staff'];
    } else if (role === 'STORE_MANAGER') {
      permissions = ['store:read', 'store:write'];
      accessibleModules = ['dashboard', 'products', 'orders', 'inventory', 'customers', 'support'];
    } else if (role === 'STORE_EMPLOYEE') {
      permissions = ['store:read'];
      accessibleModules = ['dashboard', 'products', 'orders'];
    } else {
      permissions = ['storefront:access'];
      accessibleModules = ['storefront'];
    }

    return { permissions, accessibleModules, isSuperAdmin };
  }

  async login(loginDto: LoginDto, clientIp: string = 'unknown', userAgent: string = 'unknown', requestedStoreId?: string, requestedStoreSlug?: string) {
    const { email, password } = loginDto;
    this.logger.log(`Login request received for email: ${email}`);

    let user;
    try {
      this.logger.log(`Looking up standard User: ${email} in public schema`);
      user = await this.usersService.findByEmail(email);
    } catch (error: any) {
      this.logger.error(`Database connection error during User lookup: ${error.message}`, error.stack);
      throw new InternalServerErrorException('An unexpected error occurred during authentication. Please check database connectivity.');
    }

    if (!user || !user.password) {
      this.logger.warn(`Auth Failed: User not found or password not set for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Auth Failed: Password mismatch for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const role = user.roles?.[0] || 'USER';

    // Resolve tenant based on UserRegistry and requested store
    let storeId = '';
    let tenantId = 'platform';
    
    if (role === 'SUPER_ADMIN') {
      // Super admin can login to the platform without a store context, ignoring any provided headers
      tenantId = 'platform';
      storeId = '';
    } else {
      // Find all stores this user belongs to
      const registries = await this.prisma.public.userRegistry.findMany({
        where: { email }
      });
      
      let targetRegistry;
      
      if (requestedStoreId || requestedStoreSlug) {
        // Strict tenant resolution based on requested store
        let store;
        if (requestedStoreId) {
          store = await this.prisma.public.store.findUnique({ where: { id: requestedStoreId } });
        } else if (requestedStoreSlug) {
          store = await this.prisma.public.store.findUnique({ where: { slug: requestedStoreSlug } });
        }
        
        if (!store) {
           throw new UnauthorizedException('Invalid store context requested.');
        }
        
        targetRegistry = registries.find(r => r.storeId === store.id);
        
        if (!targetRegistry) {
          throw new UnauthorizedException('User is not registered in this store.');
        }
      } else {
        // If no store is requested, but user has stores, default to the first one.
        targetRegistry = registries[0];
      }
      
      if (targetRegistry) {
        storeId = targetRegistry.storeId;
        tenantId = targetRegistry.schema;
      } else if (!storeId && !tenantId) {
        // If they have no registry and didn't request a store, let them login to platform
        // (e.g. newly registered user who hasn't created a store yet)
        if (requestedStoreId || requestedStoreSlug) {
           throw new UnauthorizedException('User is not assigned to any store.');
        }
        tenantId = 'platform';
        storeId = '';
      }
    }

    const userId = user.id;
    const payload: JwtPayload = { 
      sub: userId, 
      email: user.email, 
      role,
      tenantId,
      storeId
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES', '15m'),
    } as JwtSignOptions);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES', '30d'),
    } as JwtSignOptions);

    const meta = this.getRoleMetadata(role);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role,
        roles: user.roles,
        permissions: meta.permissions,
        accessibleModules: meta.accessibleModules,
        isSuperAdmin: meta.isSuperAdmin,
        storeId,
        tenantId,
      },
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
    const role = user.roles?.[0] || 'USER';
    const meta = this.getRoleMetadata(role);

    const registry = await this.prisma.public.userRegistry.findFirst({
      where: { email: user.email },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role,
      roles: user.roles,
      permissions: meta.permissions,
      accessibleModules: meta.accessibleModules,
      isSuperAdmin: meta.isSuperAdmin,
      storeId: registry?.storeId || '',
      tenantId: registry?.schema || 'platform',
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
