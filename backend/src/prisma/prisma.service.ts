import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient as PublicPrisma } from '@prisma/public-client';
import { PrismaClient as TenantPrisma } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

export interface TenantContext {
  storeId: string;
  schemaName: string;
  client: TenantPrisma;
}

export const tenantContextStorage = new AsyncLocalStorage<TenantContext>();

const PUBLIC_MODELS = ['superAdmin', 'store', 'apiKey', 'plan', 'ticket', 'userRegistry'];

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public public: PublicPrisma;
  private tenantClients = new Map<string, TenantPrisma>();
  private tenantPools = new Map<string, Pool>();
  private publicPool: Pool;
  public client: any;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL!;
    this.publicPool = new Pool({ connectionString: databaseUrl });
    this.publicPool.on('connect', (client) => {
      client.query('SET search_path TO "public"');
    });
    const adapter = new PrismaPg(this.publicPool, { schema: 'public' });

    this.public = new PublicPrisma({ adapter });

    // Create the proxy that dynamically routes queries to the correct schema
    const self = this;
    this.client = new Proxy({}, {
      get(target, prop) {
        const propStr = prop as string;

        if (propStr === '$connect') {
          return () => self.public.$connect();
        }
        if (propStr === '$disconnect') {
          return () => self.onModuleDestroy();
        }
        if (propStr === '$transaction') {
          const tenant = self.tenant;
          return tenant.$transaction.bind(tenant);
        }
        if (propStr === '$executeRawUnsafe') {
          const tenant = self.tenant;
          return tenant.$executeRawUnsafe.bind(tenant);
        }
        if (propStr === '$queryRawUnsafe') {
          const tenant = self.tenant;
          return tenant.$queryRawUnsafe.bind(tenant);
        }

        if (PUBLIC_MODELS.includes(propStr)) {
          return (self.public as any)[propStr];
        }

        // Default to dynamic tenant client
        return (self.tenant as any)[propStr];
      }
    });
  }

  async onModuleInit() {
    await this.public.$connect();
  }

  async onModuleDestroy() {
    await this.public.$disconnect();
    await this.publicPool.end();
    for (const client of this.tenantClients.values()) {
      await client.$disconnect();
    }
    for (const pool of this.tenantPools.values()) {
      await pool.end();
    }
  }

  get tenant(): TenantPrisma {
    const context = tenantContextStorage.getStore();
    if (!context) {
      throw new Error('Tenant context not initialized. Ensure request passes through TenantMiddleware.');
    }
    return context.client;
  }

  getTenantClient(schemaName: string): TenantPrisma {
    let client = this.tenantClients.get(schemaName);
    if (!client) {
      const databaseUrl = process.env.DATABASE_URL!;
      const url = new URL(databaseUrl);
      url.searchParams.set('schema', schemaName);

      const pool = new Pool({ connectionString: url.toString() });
      pool.on('connect', (pgClient) => {
        pgClient.query(`SET search_path TO "${schemaName}", "public"`);
      });

      const adapter = new PrismaPg(pool, { schema: schemaName });
      client = new TenantPrisma({ adapter });

      this.tenantClients.set(schemaName, client);
      this.tenantPools.set(schemaName, pool);
    }
    return client;
  }
}
