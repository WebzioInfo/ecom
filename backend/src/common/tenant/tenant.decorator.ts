import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantRequest } from '../interfaces/request.interface';

export const Tenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<TenantRequest>();
    return request.storeId || (request.headers['x-store-id'] as string) || null;
  },
);
