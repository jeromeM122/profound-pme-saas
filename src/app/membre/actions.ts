'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/server/db'
import { requireUser } from '@/server/guards'
import { limiter } from '@/server/security/ratelimit'

const followSchema = z.object({ targetId: z.cuid(), path: z.string().regex(/^\/[a-z0-9/_.@-]{0,80}$/i).optional() })

/** Follow / unfollow a public member. Idempotent, rate-limited, cannot follow yourself or a private profile. */
export async function toggleFollow(formData: FormData) {
  const me = await requireUser()
  const parsed = followSchema.safeParse({ targetId: formData.get('targetId'), path: formData.get('path') ?? undefined })
  if (!parsed.success || parsed.data.targetId === me.id) return
  if (!(await limiter().limit('profileWrite', `u:${me.id}`)).success) return

  const target = await db.user.findFirst({ where: { id: parsed.data.targetId, isPublic: true, deletedAt: null }, select: { id: true } })
  if (!target) return

  const key = { followerId_followingId: { followerId: me.id, followingId: target.id } }
  const existing = await db.follow.findUnique({ where: key, select: { createdAt: true } })
  if (existing) await db.follow.delete({ where: key })
  else await db.follow.create({ data: { followerId: me.id, followingId: target.id } }).catch(() => undefined)

  if (parsed.data.path) revalidatePath(parsed.data.path)
}
