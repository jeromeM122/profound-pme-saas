import 'server-only'
import type { Profile } from '@/content/routines'
import { auth } from '@/server/auth'
import { getCurrentDiagnostic } from './profile'

/** The visitor's hair profile (account or signed quiz cookie), or null. */
export async function getVisitorProfile(): Promise<Profile | null> {
  const session = await auth()
  const d = await getCurrentDiagnostic(session?.user?.id ?? null)
  return d ? { texture: d.texture, porosity: d.porosity, goals: d.goals } : null
}
