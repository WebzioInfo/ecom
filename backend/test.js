const { PrismaClient } = require('@prisma/public-client');
const prisma = new PrismaClient();
prisma.userRegistry.findFirst()
  .then(console.log)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
