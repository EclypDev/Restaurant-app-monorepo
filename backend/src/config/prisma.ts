import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/restaurante'

// Singleton global para evitar múltiples instancias en hot-reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

function createPrisma() {
  const pool = new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  })

  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  globalForPrisma.pool = pool
  globalForPrisma.prisma = prisma

  return { prisma, pool }
}

const { prisma, pool } = globalForPrisma.prisma
  ? { prisma: globalForPrisma.prisma, pool: globalForPrisma.pool! }
  : createPrisma()

export { prisma, pool }

export async function connectDatabase() {
  await prisma.$connect()
  console.log('✅ Prisma connected to PostgreSQL')
}

export async function disconnectDatabase() {
  await prisma.$disconnect()
  await pool.end()
  console.log('🔌 Prisma disconnected')
}
