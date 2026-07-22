import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthenticatedRequest } from '../interfaces/request.interface';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const storeIdHeader = request.headers['x-store-id'] as string | undefined;
    const apiKeyHeader = request.headers['x-api-key'] as string | undefined;

    if (request.user) {
      const userRoles = (request.user.roles || []).map((r: string) =>
        r.toLowerCase(),
      );
      const isSuperAdmin =
        userRoles.includes('super_admin') || userRoles.includes('admin');

      if (!isSuperAdmin) {
        // Strict tenant isolation: Store Admins can ONLY use their assigned storeId
        if (request.user.storeId) {
          request.storeId = request.user.storeId;
        } else {
          throw new ForbiddenException(
            'Tenant context missing for store admin',
          );
        }
      } else {
        // Super Admin can override tenant context via header
        if (storeIdHeader) {
          request.storeId = storeIdHeader;
        }
      }
    } else if (storeIdHeader) {
      // Allow for public/storefront API if no user is present
      request.storeId = storeIdHeader;
    }

    if (apiKeyHeader) {
      request.apiKey = apiKeyHeader;
    }

    return next.handle();
  }
}
