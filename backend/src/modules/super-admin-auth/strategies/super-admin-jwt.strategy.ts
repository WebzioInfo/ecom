import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SuperAdminsService } from '../../super-admins/super-admins.service';

import { SuperAdminJwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@Injectable()
export class SuperAdminJwtStrategy extends PassportStrategy(
  Strategy,
  'super-admin-jwt',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly superAdminsService: SuperAdminsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') ||
        'super_admin_fallback_secret_change_in_prod',
    });
  }

  async validate(payload: SuperAdminJwtPayload) {
    // Only allow tokens explicitly marked as SUPER_ADMIN
    if (payload.type !== 'SUPER_ADMIN') {
      throw new UnauthorizedException(
        'Invalid token type for Super Admin endpoint',
      );
    }

    const admin = await this.superAdminsService.findById(payload.sub);
    if (!admin) {
      throw new UnauthorizedException('Super Admin not found');
    }
    if (!admin.isActive || admin.status?.toUpperCase() !== 'ACTIVE') {
      throw new UnauthorizedException('Super Admin account is suspended');
    }

    return {
      userId: (admin._id as { toString(): string }).toString(),
      email: admin.email,
      role: admin.role,
      type: 'SUPER_ADMIN',
    };
  }
}
