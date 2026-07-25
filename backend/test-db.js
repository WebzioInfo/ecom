const { PrismaClient } = require('@prisma/public-client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.userRegistry.findMany();
  console.log("USERS:", users);
  
  const stores = await prisma.store.findMany();
  console.log("STORES:", stores);
}

main().catch(console.error).finally(() => prisma.$disconnect());
