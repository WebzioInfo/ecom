const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 

async function main() { 
  console.log('--- UserRegistry ---');
  console.log(await prisma.userRegistry.findMany()); 
  
  console.log('--- Stores ---');
  console.log(await prisma.store.findMany());
} 
main().catch(console.error).finally(() => prisma.$disconnect());
