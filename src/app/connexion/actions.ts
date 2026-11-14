'use server'

import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'
import { callbackUrlSchema, magicLinkFormSchema } from '@/lib/validators/auth'
import { enabledProviders, signIn } from '@/server/auth'
import { env } from '@/server/env'
import { hashIp } from '@/server/security/crypto'
import { clientIp, limiter } from '@/server/security/ratelimit'

function back(error: string, callbackUrl: string): never {
  redirect(`/connexion?error=${encodeURIComponent(error)}&callbackUrl=${encodeURIComponent(callbackUrl)}`)
}

/** Magic link. Rate-limited per IP and per target address (prevents mail-bombing a victim). */
export async function requestMagicLink(formData: FormData) {
  const parsed = magicLinkFormSchema.safeParse({
    email: formData.get('email'),
    callbackUrl: formData.get('callbackUrl') ?? undefined,
  })
  const callbackUrl = parsed.success ? parsed.data.callbackUrl : '/compte'
  if (!parsed.success) back('InvalidEmail', callbackUrl)
  if (!enabledProviders().email) back('Configuration', callbackUrl)

  const secret = env().APP_HMAC_SECRET
  const ipKey = hashIp(clientIp(await headers()), secret)
  const emailKey = createHash('sha256').update(`${secret}:${parsed.data.email}`).digest('base64url')
  const [byIp, byEmail] = await Promise.all([
    limiter().limit('authEmail', `ip:${ipKey}`),
    limiter().limit('authEmail', `em:${emailKey}`),
  ])
  if (!byIp.success || !byEmail.success) back('RateLimited', callbackUrl)

  try {
    await signIn('nodemailer', { email: parsed.data.email, redirectTo: callbackUrl, redirect: false })
  } catch (err) {
    if (err instanceof AuthError) back(err.type, callbackUrl)
    throw err
  }
  redirect('/connexion/verification')
}

export async function signInWithOAuth(formData: FormData) {
  const provider = formData.get('provider')
  const callbackUrl = callbackUrlSchema.parse(formData.get('callbackUrl') ?? '/compte')
  const enabled = enabledProviders()
  if ((provider !== 'google' || !enabled.google) && (provider !== 'apple' || !enabled.apple)) {
    back('Configuration', callbackUrl)
  }
  try {
    await signIn(provider, { redirectTo: callbackUrl })
  } catch (err) {
    if (err instanceof AuthError) back(err.type, callbackUrl)
    throw err
  }
}
