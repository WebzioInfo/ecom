import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { SuperAdminsService } from '../super-admins/super-admins.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private superAdminsService: SuperAdminsService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;
    
    // Check SuperAdmins first to avoid conflict
    const existingAdmin = await this.superAdminsService.findByEmail(email);
    if (existingAdmin) {
      throw new ConflictException('Email already in use');
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

    const payload: JwtPayload = {
      sub: (newUser._id as { toString(): string }).toString(),
      email: newUser.email,
      role: newUser.roles?.[0] || 'user',
      isSuperAdmin: false,
      isPlatformAdmin: false,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      verificationToken,
    };
  }

  async login(loginDto: LoginDto, clientIp: string = 'unknown', userAgent: string = 'unknown') {
    const { email, password } = loginDto;
    
    // 1. Check SuperAdmin
    const admin = await this.superAdminsService.findByEmail(email);
    if (admin) {
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');
      if (!admin.isActive || admin.status?.toUpperCase() !== 'ACTIVE') {
        throw new UnauthorizedException('Account is suspended');
      }

      const adminId = (admin._id as { toString(): string }).toString();
      await this.superAdminsService.recordLoginHistory(adminId, clientIp, userAgent);

      const payload: JwtPayload = {
        sub: adminId,
        email: admin.email,
        role: admin.role || 'super_admin',
        isSuperAdmin: true,
        isPlatformAdmin: true,
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
        user: { id: adminId, name: admin.name, email: admin.email, role: payload.role, isSuperAdmin: true },
      };
    }

    // 2. Check Standard User
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userId = (user._id as { toString(): string }).toString();
    const payload: JwtPayload = { 
      sub: userId, 
      email: user.email, 
      role: user.roles?.[0] || 'user',
      isSuperAdmin: false,
      isPlatformAdmin: false,
      tenantId: undefined, // Depending on user's stores, can be populated here or in a StoreUserService
      storeId: undefined
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
      user: { id: userId, name: user.name, email: user.email, role: payload.role, isSuperAdmin: false },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded: any = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const payload = decoded as JwtPayload;

      let validUser = false;
      if (payload.isSuperAdmin) {
        const admin = await this.superAdminsService.findById(payload.sub);
        if (admin && admin.isActive) validUser = true;
      } else {
        const user = await this.usersService.findById(payload.sub);
        if (user) validUser = true;
      }

      if (!validUser) {
        throw new UnauthorizedException('User not found or suspended');
      }

      const newPayload: JwtPayload = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        isSuperAdmin: payload.isSuperAdmin,
        isPlatformAdmin: payload.isPlatformAdmin,
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

  async getProfile(userId: string, isSuperAdmin: boolean) {
    if (isSuperAdmin) {
      const admin = await this.superAdminsService.findById(userId);
      if (!admin) throw new UnauthorizedException('Super Admin not found');
      return {
        id: (admin._id as { toString(): string }).toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isSuperAdmin: true,
      };
    } else {
      const user = await this.usersService.findById(userId);
      if (!user) throw new UnauthorizedException('User not found');
      return {
        id: (user._id as { toString(): string }).toString(),
        name: user.name,
        email: user.email,
        roles: user.roles,
        isSuperAdmin: false,
      };
    }
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('No account registered with this email');

    const resetToken = randomBytes(24).toString('hex');
    const resetTokenExpiration = new Date(Date.now() + 1000 * 60 * 30);
    await this.usersService.updateProfile(user._id.toString(), {
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
    await this.usersService.updateProfile(user._id.toString(), {
      password: hashedPassword,
      resetToken: undefined,
      resetTokenExpiration: undefined,
    });

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) throw new UnauthorizedException('Invalid verification token');

    await this.usersService.updateProfile(user._id.toString(), {
      isVerified: true,
      verificationToken: undefined,
    });
    return { message: 'Email verified successfully' };
  }
}
