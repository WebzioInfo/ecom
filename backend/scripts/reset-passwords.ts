import { PrismaClient } from '@prisma/public-client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.$queryRawUnsafe<any[]>(`SELECT id, email, password, roles FROM "public"."User"`);
  console.log('Registered Users:');
  for (const u of users) {
    console.log(`- ${u.email} [${u.roles}] (password length: ${u.password?.length})`);
  }
  
  // Reset password to 'Password123!' for admin@webzio.com and admin@store.com
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  
  for (const u of users) {
    if (['admin@webzio.com', 'admin@store.com'].includes(u.email)) {
      await prisma.$executeRawUnsafe(`UPDATE "public"."User" SET password = $1 WHERE email = $2`, hashedPassword, u.email);
      console.log(`Updated password for ${u.email} to Password123!`);
    }
  }

  const updatedUsers = await prisma.$queryRawUnsafe<any[]>(`SELECT id, email, password, roles FROM "public"."User"`);
  console.log('Updated Users:');
  for (const u of updatedUsers) {
    const isMatch = await bcrypt.compare('Password123!', u.password);
    console.log(`- ${u.email} | match Password123!: ${isMatch}`);
  }
}

main().finally(() => prisma.$disconnect());
