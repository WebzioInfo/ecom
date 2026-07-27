require('dotenv').config();
const { PrismaClient } = require('@prisma/public-client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool, { schema: 'public' });
  const prisma = new PrismaClient({ adapter });

  const users = await prisma.user.findMany({ take: 10 });
  console.log('Registered Users:', users.map(u => ({ email: u.email, role: u.role, storeId: u.storeId })));
  const registries = await prisma.userRegistry.findMany({ take: 10 });
  console.log('User Registries:', registries.map(r => ({ email: r.email, role: r.role, storeId: r.storeId, schemaName: r.schemaName })));

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
