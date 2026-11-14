import 'server-only'
import { notFound, redirect } from 'next/navigation'
import type { Role } from '@/generated/prisma/enums'
import { auth } from '@/server/auth'
import { hasRole } from '@/server/rbac'

/**
 * Authorization must be checked here (in each page / server action / route handler),
 * never only in the proxy — see Next.js data-security guidance.
 */
export async function requireUser(callbackUrl = '/compte') {
  const session = await auth()
  if (!session?.user?.id) redirect(`/connexion?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  return session.user
}

/** Unauthorized roles get a 404 so that privileged areas are not discoverable. */
export async function requireRole(role: Role, callbackUrl = '/compte') {
  const user = await requireUser(callbackUrl)
  if (!hasRole(user.role, role)) notFound()
  return user
}
