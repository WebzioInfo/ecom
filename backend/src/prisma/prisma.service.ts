import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
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

const PUBLIC_MODELS = ['store', 'user', 'apiKey', 'plan', 'ticket', 'userRegistry'];
const MAX_CACHED_TENANT_CLIENTS = 50;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public public: PublicPrisma;
  private tenantClients = new Map<string, TenantPrisma>();
  private tenantPools = new Map<string, Pool>();
  private publicPool: Pool;
  public client: any;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL!;
    this.publicPool = new Pool({
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
    });

    this.publicPool.on('connect', (client) => {
      client.query('SET search_path TO "public"');
    });

    const adapter = new PrismaPg(this.publicPool, { schema: 'public' });
    this.public = new PublicPrisma({ adapter });

    const self = this;
    this.client = new Proxy(
      {},
      {
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

          return (self.tenant as any)[propStr];
        },
      },
    );
  }

  async onModuleInit() {
    await this.public.$connect();
    this.logger.log('PrismaService initialized cleanly for Public database schema');
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down Prisma database connection pools...');
    await this.public.$disconnect();
    await this.publicPool.end();

    for (const [schema, client] of this.tenantClients.entries()) {
      try {
        await client.$disconnect();
      } catch (e) {
        this.logger.error(`Error disconnecting client for schema ${schema}:`, e);
      }
    }
    for (const pool of this.tenantPools.values()) {
      try {
        await pool.end();
      } catch (e) {
        this.logger.error('Error ending tenant pool:', e);
      }
    }

    this.tenantClients.clear();
    this.tenantPools.clear();
  }

  get tenant(): TenantPrisma {
    const context = tenantContextStorage.getStore();
    if (!context) {
      throw new Error('Tenant context not initialized. Request must pass through TenantMiddleware.');
    }
    return context.client;
  }

  getTenantClient(schemaName: string): TenantPrisma {
    let client = this.tenantClients.get(schemaName);
    if (!client) {
      // LRU Eviction to prevent connection exhaustion
      if (this.tenantClients.size >= MAX_CACHED_TENANT_CLIENTS) {
        const oldestSchema = this.tenantClients.keys().next().value;
        if (oldestSchema) {
          const oldClient = this.tenantClients.get(oldestSchema);
          const oldPool = this.tenantPools.get(oldestSchema);
          oldClient?.$disconnect().catch(() => {});
          oldPool?.end().catch(() => {});
          this.tenantClients.delete(oldestSchema);
          this.tenantPools.delete(oldestSchema);
          this.logger.log(`Evicted tenant client pool for schema: ${oldestSchema}`);
        }
      }

      const databaseUrl = process.env.DATABASE_URL!;
      const url = new URL(databaseUrl);
      url.searchParams.set('schema', schemaName);

      // Controlled pool size per tenant client instance
      const pool = new Pool({
        connectionString: url.toString(),
        max: 5,
        idleTimeoutMillis: 10000,
      });

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
