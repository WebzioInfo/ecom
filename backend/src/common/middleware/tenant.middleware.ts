import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { PrismaService, tenantContextStorage } from '../../prisma/prisma.service';
import { AuthenticatedRequest } from '../interfaces/request.interface';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    let storeId: string | null = null;
    let schemaName: string | null = null;

    // Bypass tenant resolution for Super Admin login endpoint
    if (req.path && req.path.includes('/auth/super-admin-login')) {
      return next();
    }

    const storeIdHeader = req.headers['x-store-id'] as string | undefined;
    const storeSlugHeader = req.headers['x-store-slug'] as string | undefined;
    const apiKeyHeader = req.headers['x-api-key'] as string | undefined;
    const authHeader = req.headers['authorization'];

    // 1. Check x-store-id header
    if (storeIdHeader) {
      storeId = storeIdHeader;
    }

    // 1.5 Check x-store-slug header
    if (!storeId && storeSlugHeader) {
      const storeDoc = await this.prisma.public.store.findUnique({
        where: { slug: storeSlugHeader },
      });
      if (storeDoc) {
        storeId = storeDoc.id;
      }
    }

    // 2. Resolve from API key if present
    if (!storeId && apiKeyHeader) {
      const keyDoc = await this.prisma.public.apiKey.findUnique({
        where: { key: apiKeyHeader },
      });
      if (keyDoc) {
        storeId = keyDoc.storeId;
      }
    }

    // 3. Resolve from JWT payload
    if (!storeId && authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.decode(token) as any;
        if (decoded && decoded.storeId) {
          storeId = decoded.storeId;
        }
      } catch {}
    }

    // If still no storeId, just continue without context
    // Login endpoints will bypass tenant resolution, while protected tenant endpoints
    // will be guarded by AuthGuard and TenantGuard

    if (!storeId) {
      // Proceed without tenant context (for public endpoints / super-admin)
      return next();
    }

    // Resolve schemaName from store slug
    const store = await this.prisma.public.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return next();
    }

    schemaName = `tenant_${store.slug.replace(/-/g, '_')}`;

    // Provision the schema dynamically if it doesn't exist
    await this.prisma.public.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

    // Check if the tables exist inside this schema (e.g. check "User" table)
    const tableCheck = await this.prisma.public.$queryRawUnsafe<{ exists: boolean }[]>(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables 
         WHERE  table_schema = '${schemaName}'
         AND    table_name   = 'Product'
       );`
    );

    const client = this.prisma.getTenantClient(schemaName);

    if (!tableCheck[0]?.exists) {
      console.log(`Provisioning schema tables for ${schemaName}...`);
      const sqlPath = path.join(__dirname, '../../../../prisma/tenant-schema.sql');
      if (fs.existsSync(sqlPath)) {
        const sql = fs.readFileSync(sqlPath, 'utf8');
        // Execute the schema initialization SQL script on the tenant client
        await client.$executeRawUnsafe(sql);
        console.log(`Schema tables provisioned successfully for ${schemaName}!`);
      } else {
        console.error(`tenant-schema.sql template not found at ${sqlPath}!`);
      }
    }

    // Set request property
    req.storeId = storeId;

    // Run downstream handlers inside context storage
    tenantContextStorage.run({ storeId, schemaName, client }, () => {
      next();
    });
  }
}
