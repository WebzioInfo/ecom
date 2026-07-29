import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: any) => {
          if (req && req.cookies && req.cookies.access_token) {
            return req.cookies.access_token;
          }
          if (req && req.headers && req.headers['x-access-token']) {
            return req.headers['x-access-token'] as string;
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_ACCESS_SECRET ||
        configService.get<string>('jwt.accessSecret') ||
        configService.get<string>('JWT_ACCESS_SECRET') ||
        'super_secret_access_key_change_in_production',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload || !payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid or expired token payload');
    }
    if (payload.type && payload.type === 'refresh') {
      throw new UnauthorizedException('Invalid token type. Refresh token cannot be used as an access token.');
    }
    return {
      userId: payload.sub,
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      roles: payload.roles || [payload.role],
      permissions: payload.permissions || [],
      storeId: payload.storeId,
      tenantId: payload.tenantId,
      schemaName: payload.schemaName,
      allowedStores: payload.allowedStores || (payload.storeId ? [payload.storeId] : []),
    };
  }
}
