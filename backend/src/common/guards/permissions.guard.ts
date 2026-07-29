import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthenticatedRequest } from '../interfaces/request.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied. Unauthenticated.');
    }

    // Normalize user permissions to use dots for consistency (e.g. 'products:create' -> 'products.create')
    const userPermissions = (user.permissions || []).map((p) => p.replace(/:/g, '.'));
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.roles?.includes('SUPER_ADMIN');

    if (isSuperAdmin || userPermissions.includes('*')) {
      return true;
    }

    const hasPermission = requiredPermissions.every((requiredPerm) => {
      const normalizedReq = requiredPerm.replace(/:/g, '.');
      
      // Direct match
      if (userPermissions.includes(normalizedReq)) return true;

      // Wildcard match (e.g. if user has 'products.*' and required is 'products.create')
      const [moduleName] = normalizedReq.split('.');
      if (userPermissions.includes(`${moduleName}.*`)) {
        return true;
      }

      return false;
    });

    if (!hasPermission) {
      this.logger.warn(
        `[RBAC Guard] User ${user.email} denied access to route. Required permissions: [${requiredPermissions.join(', ')}], User permissions (from token): [${(user.permissions || []).join(', ')}]`,
      );
      throw new ForbiddenException(
        'You do not have the required permissions to perform this operation',
      );
    }

    return true;
  }
}
