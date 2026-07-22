import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthenticatedRequest } from '../../../common/interfaces/request.interface';

@Injectable()
export class SuperAdminRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user || user.type !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Access denied: Must be a Super Admin');
    }

    const hasRole = user.role ? requiredRoles.includes(user.role) : false;
    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have the required Super Admin role',
      );
    }

    return true;
  }
}
