import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Signed, tamper-proof payloads for cookies (e.g. the anonymous quiz result).
 * Format: base64url(json) + "." + base64url(HMAC-SHA256). Not encrypted — never put secrets inside.
 */
export function signPayload(payload: unknown, secret: string, ttlSeconds: number, now = Date.now()): string {
  const body = Buffer.from(JSON.stringify({ v: payload, exp: Math.floor(now / 1000) + ttlSeconds })).toString('base64url')
  return `${body}.${mac(body, secret)}`
}

export function verifyPayload<T = unknown>(token: string | undefined, secret: string, now = Date.now()): T | null {
  if (!token || token.length > 4096) return null
  const dot = token.indexOf('.')
  if (dot <= 0 || dot !== token.lastIndexOf('.')) return null
  const body = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = mac(body, secret)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as { v: T; exp: number }
    if (typeof parsed.exp !== 'number' || parsed.exp * 1000 < now) return null
    return parsed.v
  } catch {
    return null
  }
}

/** Pseudonymous IP fingerprint for analytics / abuse detection. Raw IPs are never stored. */
export function hashIp(ip: string, secret: string): string {
  return createHmac('sha256', secret).update(`ip:${ip}`).digest('base64url').slice(0, 32)
}

function mac(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('base64url')
}
