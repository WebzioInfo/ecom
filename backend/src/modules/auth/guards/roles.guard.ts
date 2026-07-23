import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '../../../common/interfaces/request.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

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

    if (!user) {
      this.logger.warn(`[RBAC] No user on request for: ${request.url}`);
      throw new ForbiddenException('Access denied');
    }



    const userRolesLower = (user.roles || []).map((r) => r.toLowerCase());
    if (user.role) userRolesLower.push(user.role.toLowerCase());
    
    const requiredRolesLower = requiredRoles.map((r) => r.toLowerCase());

    const hasRole = requiredRolesLower.some((reqRole) =>
      userRolesLower.includes(reqRole),
    );

    if (!hasRole) {
      this.logger.warn(
        `[RBAC] User ${user.userId} with roles [${userRolesLower.join(', ')}] ` +
          `attempted to access route requiring [${requiredRoles.join(', ')}]: ${request.url}`,
      );
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
