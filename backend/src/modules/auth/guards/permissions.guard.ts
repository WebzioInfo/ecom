import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthenticatedRequest } from '../../../common/interfaces/request.interface';

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
      this.logger.warn(`[ABAC] No user on request for: ${request.url}`);
      throw new ForbiddenException('Access denied');
    }

    const userPermissions = user.permissions || [];

    // Super Admin or Wildcard scope access
    if (userPermissions.includes('*') || userPermissions.includes('store:*')) {
      return true;
    }

    const hasPermission = requiredPermissions.every((reqPerm) =>
      userPermissions.includes(reqPerm),
    );

    if (!hasPermission) {
      this.logger.warn(
        `[ABAC] User ${user.userId} missing required permissions [${requiredPermissions.join(', ')}]: ${request.url}`,
      );
      throw new ForbiddenException(
        'You do not have the required permissions to perform this action',
      );
    }

    return true;
  }
}
