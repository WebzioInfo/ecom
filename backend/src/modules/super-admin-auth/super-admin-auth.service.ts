import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { SuperAdminJwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { SuperAdminsService } from '../super-admins/super-admins.service';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';

@Injectable()
export class SuperAdminAuthService {
  private readonly logger = new Logger(SuperAdminAuthService.name);

  constructor(
    private readonly superAdminsService: SuperAdminsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Login ────────────────────────────────────────────────────────────────

  async login(
    loginDto: SuperAdminLoginDto,
    clientIp: string = 'unknown',
    userAgent: string = 'unknown',
  ) {
    // 1. Find admin by email (with password selected)
    const admin = await this.superAdminsService.findByEmail(loginDto.email);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      admin.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Check account status (case-insensitive for backward compat)
    if (!admin.isActive || admin.status?.toUpperCase() !== 'ACTIVE') {
      throw new UnauthorizedException('Account is suspended');
    }

    const adminId = (admin._id as { toString(): string }).toString();

    // 4. Record login history and update lastLogin
    await this.superAdminsService.recordLoginHistory(
      adminId,
      clientIp,
      userAgent,
    );

    // 5. Build JWT payload
    const payload = {
      sub: adminId,
      email: admin.email,
      role: admin.role,
      type: 'SUPER_ADMIN',
    };

    // 6. Sign access token & refresh token
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES', '15m'),
    } as JwtSignOptions);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES', '30d'),
    } as JwtSignOptions);

    this.logger.log(`Super Admin logged in: ${admin.email} from ${clientIp}`);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      user: {
        id: adminId,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        emailVerified: (admin as unknown as { emailVerified?: boolean })
          .emailVerified,
        lastLogin: admin.lastLogin,
        avatar: admin.avatar,
      },
    };
  }

  // ─── Refresh Token ────────────────────────────────────────────────────────

  async refresh(refreshToken: string) {
    try {
      const decoded: unknown = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const payload = decoded as SuperAdminJwtPayload;
      if (payload.type !== 'SUPER_ADMIN') {
        throw new UnauthorizedException('Invalid token type');
      }

      const admin = await this.superAdminsService.findById(payload.sub);
      if (!admin || !admin.isActive) {
        throw new UnauthorizedException('Super Admin not found or suspended');
      }

      const newPayload = {
        sub: (admin._id as { toString(): string }).toString(),
        email: admin.email,
        role: admin.role,
        type: 'SUPER_ADMIN',
      };

      return {
        access_token: this.jwtService.sign(newPayload, {
          expiresIn: this.configService.get<string>(
            'JWT_ACCESS_EXPIRES',
            '15m',
          ),
        } as JwtSignOptions),
        token_type: 'Bearer',
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // ─── Get Profile ──────────────────────────────────────────────────────────

  async getProfile(adminId: string) {
    const admin = await this.superAdminsService.findById(adminId);
    if (!admin) {
      throw new UnauthorizedException('Super Admin not found');
    }

    return {
      id: (admin._id as { toString(): string }).toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      emailVerified: (admin as unknown as { emailVerified?: boolean })
        .emailVerified,
      lastLogin: admin.lastLogin,
      avatar: admin.avatar,
      createdAt: (admin as unknown as { createdAt?: Date }).createdAt,
    };
  }
}
