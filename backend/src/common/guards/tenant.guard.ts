import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { tenantContextStorage } from '../../prisma/prisma.service';
import { AuthenticatedRequest } from '../interfaces/request.interface';

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const tenantContext = tenantContextStorage.getStore();

    if (!tenantContext || !tenantContext.storeId) {
      this.logger.warn(`Tenant context missing for route: ${request.url}`);
      throw new BadRequestException(
        'Tenant context missing. Please specify a valid store context via URL parameter or request domain.',
      );
    }

    const user = request.user;
    if (user) {
      const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.roles?.includes('SUPER_ADMIN');

      if (!isSuperAdmin) {
        const userStoreId = user.storeId;
        const allowedStores = user.allowedStores || [];

        // Verify user is authorized for this store context
        const isAuthorized =
          (userStoreId && userStoreId === tenantContext.storeId) ||
          allowedStores.includes(tenantContext.storeId);

        if (!isAuthorized && userStoreId) {
          this.logger.warn(
            `Cross-tenant access attempt blocked: User ${user.email} (store: ${userStoreId}) attempted to access store: ${tenantContext.storeId}`,
          );
          throw new ForbiddenException(
            'You are not authorized to access data for this store context.',
          );
        }
      }
    }

    return true;
  }
}
