import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { SuperAdminsService } from '../../super-admins/super-admins.service';

export interface JwtPayload {
  sub: string;
  email: string;
  roles?: string[];
  type?: string;
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private superAdminsService: SuperAdminsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') || 'fallback_secret',
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type === 'SUPER_ADMIN') {
      const superAdmin = await this.superAdminsService.findById(payload.sub);
      if (!superAdmin || superAdmin.status.toUpperCase() !== 'ACTIVE') {
        throw new UnauthorizedException();
      }
      return {
        userId: (superAdmin._id as { toString(): string }).toString(),
        roles: [superAdmin.role.toLowerCase()], // Map 'SUPER_ADMIN' -> 'super_admin' to match standard roles guard
        type: 'SUPER_ADMIN',
      };
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      userId: (user._id as { toString(): string }).toString(),
      roles: user.roles || [],
      type: 'USER',
    };
  }
}
