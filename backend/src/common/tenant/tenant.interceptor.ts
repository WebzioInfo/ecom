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
      // Strict tenant isolation: Store Admins can ONLY use their assigned storeId
      if (request.user.storeId) {
        request.storeId = request.user.storeId;
      } else if (request.user.tenantId) {
        request.tenantId = request.user.tenantId;
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
