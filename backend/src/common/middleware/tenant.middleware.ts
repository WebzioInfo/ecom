import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { PrismaService, tenantContextStorage } from '../../prisma/prisma.service';
import { AuthenticatedRequest } from '../interfaces/request.interface';
import { TenantResolverService } from '../tenant/tenant-resolver.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // Bypass tenant resolution for platform auth & health endpoints
    const path = req.path || req.originalUrl || '';
    if (path.includes('/auth/super-admin-login') || path.includes('/health')) {
      return next();
    }

    const resolved = await this.tenantResolver.resolveTenant(req);

    if (!resolved) {
      // Proceed without tenant context (for public/super-admin platform endpoints)
      return next();
    }

    const { storeId, schemaName } = resolved;
    const client = this.prisma.getTenantClient(schemaName);

    // Attach metadata to request object
    req.storeId = storeId;
    req.tenantId = schemaName;

    // Run downstream request handlers inside context storage
    tenantContextStorage.run({ storeId, schemaName, client }, () => {
      next();
    });
  }
}
