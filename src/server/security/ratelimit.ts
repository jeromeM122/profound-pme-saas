import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { redisCredentials } from '@/server/database-url'
import { appUrl } from './app-origin'
import { isLocalhostUrl } from './localhost'

export type LimitResult = { success: boolean; limit: number; remaining: number; reset: number }
type Window = `${number} ${'s' | 'm' | 'h'}`

/** Central rate-limit policy. Keys are per IP-hash and/or per user id. */
export const POLICIES = {
  authEmail: { tokens: 5, window: '15 m' }, // magic-link requests
  authGeneric: { tokens: 30, window: '1 m' }, // other /api/auth POSTs
  quiz: { tokens: 20, window: '1 m' },
  profileWrite: { tokens: 20, window: '1 m' },
  affiliateRedirect: { tokens: 60, window: '1 m' }, // /go/*
  apiDefault: { tokens: 120, window: '1 m' },
} as const satisfies Record<string, { tokens: number; window: Window }>

export type Policy = keyof typeof POLICIES

export interface Limiter {
  limit(policy: Policy, key: string): Promise<LimitResult>
}

const WINDOW_MS: Record<string, number> = { s: 1_000, m: 60_000, h: 3_600_000 }
export function windowMs(w: Window): number {
  const [n, unit] = w.split(' ') as [string, string]
  return Number(n) * (WINDOW_MS[unit] ?? 60_000)
}

/** Fixed-window in-memory limiter. Dev/test only — not shared across instances. */
export function createMemoryLimiter(now: () => number = Date.now): Limiter {
  const buckets = new Map<string, { count: number; reset: number }>()
  return {
    async limit(policy, key) {
      const { tokens, window } = POLICIES[policy]
      const t = now()
      const id = `${policy}:${key}`
      let b = buckets.get(id)
      if (!b || b.reset <= t) {
        b = { count: 0, reset: t + windowMs(window) }
        buckets.set(id, b)
      }
      b.count += 1
      if (buckets.size > 10_000) {
        for (const [k, v] of buckets) if (v.reset <= t) buckets.delete(k)
      }
      return { success: b.count <= tokens, limit: tokens, remaining: Math.max(0, tokens - b.count), reset: b.reset }
    },
  }
}

function createUpstashLimiter(url: string, token: string): Limiter {
  const redis = new Redis({ url, token })
  const instances = new Map<Policy, Ratelimit>()
  return {
    async limit(policy, key) {
      let rl = instances.get(policy)
      if (!rl) {
        const { tokens, window } = POLICIES[policy]
        rl = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(tokens, window), prefix: `rl:${policy}`, analytics: false })
        instances.set(policy, rl)
      }
      const r = await rl.limit(key)
      return { success: r.success, limit: r.limit, remaining: r.remaining, reset: r.reset }
    },
  }
}

let singleton: Limiter | undefined
export function limiter(): Limiter {
  if (singleton) return singleton
  // Upstash via the Vercel Marketplace may expose KV_REST_API_* (or prefixed) names.
  const { url, token } = redisCredentials()
  if (url && token) singleton = createUpstashLimiter(url, token)
  else if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV !== 'preview' && !isLocalhostUrl(appUrl())) throw new Error('Rate limiting requires Upstash Redis in production')
  else singleton = createMemoryLimiter()
  return singleton
}

/**
 * Client IP as set by the trusted edge (Vercel overwrites x-real-ip / x-forwarded-for).
 * If deployed behind another proxy, make sure it overwrites — never appends to — these headers.
 */
export function clientIp(headers: Headers): string {
  const real = headers.get('x-real-ip')
  if (real) return real.trim()
  const xff = headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]!.trim()
  return '0.0.0.0'
}
