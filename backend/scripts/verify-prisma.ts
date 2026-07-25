import { prisma } from '../lib/prisma'

async function main() {
  try {
    const entity = await prisma.product.findFirst()
    console.log('✅ Connected. Found entity:', entity?.title)
  } catch (err) {
    console.error('Connection failed:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
