import 'server-only'
import { z } from 'zod'
import { appUrl } from '@/server/security/app-origin'
import { databaseUrl, redisCredentials } from '@/server/database-url'
import { isLocalhostUrl } from '@/server/security/localhost'

const optional = z.string().trim().min(1).optional().or(z.literal('').transform(() => undefined))

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    APP_URL: z.url(),
    DATABASE_URL: z.string().startsWith('postgres'),
    AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be ≥ 32 chars (openssl rand -base64 32)'),
    APP_HMAC_SECRET: z.string().min(32, 'APP_HMAC_SECRET must be ≥ 32 chars'),
    AUTH_GOOGLE_ID: optional,
    AUTH_GOOGLE_SECRET: optional,
    AUTH_APPLE_ID: optional,
    AUTH_APPLE_SECRET: optional,
    EMAIL_SERVER: optional,
    EMAIL_FROM: optional,
    UPSTASH_REDIS_REST_URL: optional,
    UPSTASH_REDIS_REST_TOKEN: optional,
  })
  .superRefine((env, ctx) => {
    // A localhost APP_URL is the only exemption (local prod-mode testing); real domains get the full checks.
    if (env.NODE_ENV === 'production' && !isLocalhostUrl(env.APP_URL)) {
      if (!env.APP_URL.startsWith('https://')) {
        ctx.addIssue({ code: 'custom', path: ['APP_URL'], message: 'APP_URL must be https in production' })
      }
      // Private Vercel previews (behind Vercel Authentication) may use the in-memory limiter.
      if (process.env.VERCEL_ENV !== 'preview' && (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN)) {
        ctx.addIssue({ code: 'custom', path: ['UPSTASH_REDIS_REST_URL'], message: 'A shared rate-limit store is required in production' })
      }
    }
  })

export type Env = z.infer<typeof schema>

let cached: Env | undefined

/** Validated, typed environment. Fails fast with a readable error on misconfiguration. */
export function env(): Env {
  if (cached) return cached
  const parsed = schema.safeParse({
    ...process.env,
    APP_URL: appUrl(),
    DATABASE_URL: databaseUrl(),
    UPSTASH_REDIS_REST_URL: redisCredentials().url,
    UPSTASH_REDIS_REST_TOKEN: redisCredentials().token,
  })
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Invalid environment configuration:\n${details}`)
  }
  cached = parsed.data
  return cached
}
