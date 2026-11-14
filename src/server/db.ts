import 'server-only'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function create(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter, log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'] })
}

/** Single Prisma client (all queries are parameterized; raw *Unsafe APIs are lint-banned). */
export const db = globalForPrisma.prisma ?? create()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
