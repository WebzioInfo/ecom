const { PrismaClient } = require('@prisma/public-client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  pool.on('connect', (client) => {
    client.query('SET search_path TO "public"');
  });
  const adapter = new PrismaPg(pool, { schema: 'public' });
  const prisma = new PrismaClient({ adapter });
  
  try {
    const res = await prisma.userRegistry.findFirst();
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main();
