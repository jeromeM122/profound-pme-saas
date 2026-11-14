import 'server-only'
import type { Prisma } from '@/generated/prisma/client'
import { db } from '@/server/db'

/** Append-only trail of privileged actions (moderation, admin edits, role changes). */
export async function audit(actorId: string, action: string, target: string, meta?: Prisma.InputJsonValue) {
  await db.auditLog.create({ data: { actorId, action, target, meta } })
}
