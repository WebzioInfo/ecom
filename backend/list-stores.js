const { PrismaClient } = require('@prisma/public-client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

const pool = new Pool({
  connectionString: dbUrl,
  max: 2,
  idleTimeoutMillis: 30000,
});
pool.on('connect', (client) => {
  client.query('SET search_path TO "public"');
});

const adapter = new PrismaPg(pool, { schema: 'public' });
const prisma = new PrismaClient({ adapter });

async function run() {
  try {
    const stores = await prisma.store.findMany({ include: { owner: true } });
    console.log('Stores found in database:');
    stores.forEach(s => {
      console.log(`- Slug: ${s.slug}, Name: ${s.name}, Owner: ${s.owner.email}, Owner Roles: ${s.owner.roles}`);
    });

    const registries = await prisma.userRegistry.findMany();
    console.log('\nRegistries found in database:');
    registries.forEach(r => {
      console.log(`- Email: ${r.email}, Store ID: ${r.storeId}, Schema: ${r.schema}`);
    });

    const users = await prisma.user.findMany({ select: { email: true, roles: true } });
    console.log('\nUsers found in database:');
    users.forEach(u => {
      console.log(`- Email: ${u.email}, Roles: ${u.roles}`);
    });

    const tenantDbUrl = dbUrl.includes('?') ? dbUrl.replace('?', '?schema=tenant_biofix&') : (dbUrl + '?schema=tenant_biofix');
    const tenantPool = new Pool({
      connectionString: tenantDbUrl,
      max: 2,
    });
    tenantPool.on('connect', (client) => {
      client.query('SET search_path TO "tenant_biofix"');
    });
    
    const tenantAdapter = new PrismaPg(tenantPool, { schema: 'tenant_biofix' });
    const { PrismaClient: TenantPrismaClient } = require('@prisma/client');
    const tenantPrisma = new TenantPrismaClient({ adapter: tenantAdapter });

    const members = await tenantPrisma.teamMember.findMany({ include: { role: true } });
    console.log('\nTeam members in tenant_biofix:');
    members.forEach(m => {
      console.log(`- UserID: ${m.userId}, Role: ${m.role?.name}, Permissions: ${m.role?.permissions}`);
    });

    const roles = await tenantPrisma.tenantRole.findMany();
    console.log('\nRoles in tenant_biofix:');
    roles.forEach(r => {
      console.log(`- Role: ${r.name}, Permissions: ${r.permissions}`);
    });

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
