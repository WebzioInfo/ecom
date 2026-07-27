const { PrismaService } = require('./dist/prisma/prisma.service.js');
const bcrypt = require('bcrypt');

async function main() {
  const prisma = new PrismaService();
  const user = await prisma.public.user.findUnique({ where: { email: 'admin@platform.com' } });
  console.log('User exists?', !!user);
  if (user) {
    console.log('Roles:', user.roles);
    console.log('Is Verified?', user.isVerified);
    console.log('Hash in DB:', user.password);
    
    const isMatch = await bcrypt.compare('password@123', user.password);
    console.log('Match with password@123:', isMatch);
    
    const isMatchOld = await bcrypt.compare('WebzioAdmin2026!', user.password);
    console.log('Match with WebzioAdmin2026!:', isMatchOld);
  }
  await prisma.$disconnect();
}

main().catch(console.error);
