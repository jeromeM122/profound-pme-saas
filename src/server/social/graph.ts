import 'server-only'
import { db } from '@/server/db'

/** Only fields that are safe to expose on a public profile. */
export const publicUserSelect = {
  id: true,
  handle: true,
  name: true,
  image: true,
  bio: true,
  hairProfile: { select: { texture: true, porosity: true, goals: true, badgePublic: true } },
} as const

export const PUBLIC_USER_WHERE = { isPublic: true, deletedAt: null, handle: { not: null } } as const

export async function getPublicProfile(handle: string) {
  return db.user.findFirst({
    where: { handle, deletedAt: null },
    select: {
      ...publicUserSelect,
      isPublic: true,
      socialLinks: { select: { platform: true, handle: true }, orderBy: { platform: 'asc' } },
      bathroom: {
        where: { moderation: 'APPROVED' },
        select: { status: true, rating: true, recommended: true, product: { select: { slug: true, name: true, brand: { select: { name: true } } } } },
        orderBy: { updatedAt: 'desc' },
        take: 24,
      },
      _count: { select: { followers: true, following: true } },
    },
  })
}

export async function isFollowing(followerId: string, followingId: string) {
  const f = await db.follow.findUnique({ where: { followerId_followingId: { followerId, followingId } }, select: { createdAt: true } })
  return Boolean(f)
}

/** Public members sharing the exact same diagnostic key, who chose to show their badge. */
export async function findTwins(twinKey: string, excludeUserId: string | null, take = 24) {
  return db.user.findMany({
    where: {
      ...PUBLIC_USER_WHERE,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      hairProfile: { twinKey, badgePublic: true },
    },
    select: { ...publicUserSelect, _count: { select: { followers: true } } },
    orderBy: { followers: { _count: 'desc' } },
    take,
  })
}

export async function countTwins(twinKey: string, excludeUserId: string | null) {
  return db.user.count({
    where: { ...PUBLIC_USER_WHERE, ...(excludeUserId ? { id: { not: excludeUserId } } : {}), hairProfile: { twinKey, badgePublic: true } },
  })
}
