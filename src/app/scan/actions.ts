'use server'

import { headers } from 'next/headers'
import { auth } from '@/server/auth'
import { env } from '@/server/env'
import { analyzeHairPhoto, type ScanOutcome } from '@/server/scan/analyze'
import { hashIp } from '@/server/security/crypto'
import { clientIp, limiter } from '@/server/security/ratelimit'

/** Analyse a hair photo. Rate-limited per IP and per member (each scan calls a paid AI model). */
export async function scanHair(formData: FormData): Promise<ScanOutcome> {
  if (formData.get('consent') !== 'on') return { ok: false, error: 'Coche la case pour autoriser l’analyse de ta photo.' }
  const file = formData.get('photo')
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'Ajoute une photo.' }
  const session = await auth()
  const ip = hashIp(clientIp(await headers()), env().APP_HMAC_SECRET)
  const [byIp, byUser] = await Promise.all([
    limiter().limit('scan', `ip:${ip}`),
    session?.user?.id ? limiter().limit('scan', `u:${session.user.id}`) : Promise.resolve({ success: true }),
  ])
  if (!byIp.success || !byUser.success) return { ok: false, error: 'Tu as atteint la limite de scans pour le moment. Réessaie dans une heure.' }
  return analyzeHairPhoto(Buffer.from(await file.arrayBuffer()))
}
