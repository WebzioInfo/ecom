import { PrismaClient } from '@prisma/public-client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe('DROP SCHEMA IF EXISTS tenant_electronics_hub CASCADE;');
  await prisma.$executeRawUnsafe('DROP SCHEMA IF EXISTS tenant_fashion_boutique CASCADE;');
  console.log('Schemas dropped successfully.');
}

main().finally(() => prisma.$disconnect());
