import { prisma } from '../lib/prisma'

async function main() {
  try {
    const user = await prisma.user.findFirst()
    console.log('✅ Connected. Found user:', user?.name)
  } catch (err) {
    console.error('Connection failed:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
