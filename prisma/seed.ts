/**
 * Seed: promotes SEED_ADMIN_EMAIL to ADMIN (creating the user if needed).
 * This is the only way to create the first admin — there is no self-service role escalation.
 */
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase()
  if (!email) {
    console.log('SEED_ADMIN_EMAIL not set — nothing to seed.')
    return
  }
  const user = await db.user.upsert({ where: { email }, update: { role: 'ADMIN' }, create: { email, role: 'ADMIN' } })
  await db.auditLog.create({ data: { actorId: 'seed', action: 'role.grant', target: `user:${user.id}`, meta: { role: 'ADMIN' } } })
  console.log(`✔ ${email} is ADMIN`)
}

main().finally(() => db.$disconnect())
