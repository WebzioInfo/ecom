import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export interface ResolvedTenant {
  storeId: string;
  slug: string;
  schemaName: string;
}

@Injectable()
export class TenantResolverService {
  private readonly logger = new Logger(TenantResolverService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async resolveTenant(req: Request): Promise<ResolvedTenant | null> {
    // 1. Path Parameter Resolution (/api/v1/t/:storeSlug/*)
    const pathSlug = this.extractSlugFromPath(req.path || req.originalUrl);
    if (pathSlug) {
      const tenant = await this.resolveBySlug(pathSlug);
      if (tenant) return tenant;
    }

    // 2. Subdomain / Custom Domain Resolution (e.g. nike.domain.com or www.nike.com)
    const host = req.get('host') || '';
    if (host) {
      const tenantByHost = await this.resolveByHost(host);
      if (tenantByHost) return tenantByHost;
    }

    // 3. Cryptographically Verified JWT Claims
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const tenantByJwt = await this.resolveByJwt(token);
      if (tenantByJwt) return tenantByJwt;
    }

    // 4. API Key Resolution (Storefront API)
    const apiKeyHeader = req.headers['x-api-key'] as string | undefined;
    if (apiKeyHeader) {
      const tenantByApiKey = await this.resolveByApiKey(apiKeyHeader);
      if (tenantByApiKey) return tenantByApiKey;
    }

    // 5. Header Fallback (x-store-slug or x-store-id)
    const storeSlugHeader = req.headers['x-store-slug'] as string | undefined;
    if (storeSlugHeader && storeSlugHeader !== 'none' && storeSlugHeader !== 'undefined') {
      const tenant = await this.resolveBySlug(storeSlugHeader);
      if (tenant) return tenant;
    }

    const storeIdHeader = req.headers['x-store-id'] as string | undefined;
    if (storeIdHeader && storeIdHeader !== 'none' && storeIdHeader !== 'undefined') {
      const tenant = await this.resolveById(storeIdHeader);
      if (tenant) return tenant;
    }

    return null;
  }

  private extractSlugFromPath(urlPath: string): string | null {
    if (!urlPath) return null;
    // Matches /api/v1/t/:storeSlug/... or /t/:storeSlug/...
    const match = urlPath.match(/\/(?:api\/v1\/)?t\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  private async resolveBySlug(slug: string): Promise<ResolvedTenant | null> {
    try {
      const store = await this.prisma.public.store.findUnique({
        where: { slug },
      });
      if (!store) return null;
      return {
        storeId: store.id,
        slug: store.slug,
        schemaName: `tenant_${store.slug.replace(/-/g, '_')}`,
      };
    } catch {
      return null;
    }
  }

  private async resolveById(id: string): Promise<ResolvedTenant | null> {
    try {
      const store = await this.prisma.public.store.findUnique({
        where: { id },
      });
      if (!store) return null;
      return {
        storeId: store.id,
        slug: store.slug,
        schemaName: `tenant_${store.slug.replace(/-/g, '_')}`,
      };
    } catch {
      return null;
    }
  }

  private async resolveByHost(host: string): Promise<ResolvedTenant | null> {
    const hostname = host.split(':')[0].toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1') return null;

    try {
      // Check Custom Domain match
      const storeByCustomDomain = await this.prisma.public.store.findFirst({
        where: { customDomain: hostname },
      });
      if (storeByCustomDomain) {
        return {
          storeId: storeByCustomDomain.id,
          slug: storeByCustomDomain.slug,
          schemaName: `tenant_${storeByCustomDomain.slug.replace(/-/g, '_')}`,
        };
      }

      // Check Subdomain (e.g. nike.platform.com -> slug: nike)
      const parts = hostname.split('.');
      if (parts.length >= 3 && !['www', 'app', 'admin', 'api'].includes(parts[0])) {
        return this.resolveBySlug(parts[0]);
      }
    } catch {
      return null;
    }
    return null;
  }

  private async resolveByJwt(token: string): Promise<ResolvedTenant | null> {
    try {
      const secret =
        process.env.JWT_ACCESS_SECRET ||
        this.configService.get<string>('jwt.accessSecret') ||
        this.configService.get<string>('JWT_ACCESS_SECRET') ||
        'super_secret_access_key_change_in_production';
      const decoded = jwt.verify(token, secret) as JwtPayload;
      if (decoded && decoded.storeId) {
        return this.resolveById(decoded.storeId);
      }
    } catch {
      // Invalid signature or expired token
      return null;
    }
    return null;
  }

  private async resolveByApiKey(apiKey: string): Promise<ResolvedTenant | null> {
    try {
      const keyDoc = await this.prisma.public.apiKey.findUnique({
        where: { key: apiKey },
      });
      if (!keyDoc) return null;
      return this.resolveById(keyDoc.storeId);
    } catch {
      return null;
    }
  }
}
