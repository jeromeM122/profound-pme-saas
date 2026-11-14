import type { Role } from '@/generated/prisma/enums'

/** Strict role hierarchy: each role inherits the permissions of the roles below it. */
export const ROLE_RANK: Record<Role, number> = { USER: 0, CREATOR: 1, MODERATOR: 2, ADMIN: 3 }

export function hasRole(actual: Role | undefined | null, required: Role): boolean {
  if (!actual) return false
  return ROLE_RANK[actual] >= ROLE_RANK[required]
}
