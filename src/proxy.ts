import { NextResponse, type NextRequest } from 'next/server'
import { allowedOrigins } from '@/server/security/app-origin'
import { buildCsp } from '@/server/security/csp'
import { hashIp } from '@/server/security/crypto'
import { isCrossSiteAllowed, isSameOrigin, isStateChanging } from '@/server/security/origin'
import { clientIp, limiter, type Policy } from '@/server/security/ratelimit'

/**
 * Edge of the app (Node runtime). Defence-in-depth only — every page, server action and
 * route handler still performs its own authentication/authorization and validation.
 *  1. CSRF: state-changing requests must come from our own origin.
 *  2. Rate limiting on sensitive endpoints.
 *  3. Per-request CSP nonce.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const method = req.method.toUpperCase()

  if (isStateChanging(method) && !isCrossSiteAllowed(pathname)) {
    const configured = allowedOrigins()
    if (!isSameOrigin(req.headers, configured.length ? configured : [req.nextUrl.origin])) {
      return NextResponse.json({ error: 'forbidden_origin' }, { status: 403 })
    }
  }

  const policy = pickPolicy(pathname, method)
  if (policy) {
    const key = hashIp(clientIp(req.headers), process.env.APP_HMAC_SECRET ?? 'dev-only')
    const r = await limiter().limit(policy, key)
    if (!r.success) {
      const retryAfter = Math.max(1, Math.ceil((r.reset - Date.now()) / 1000))
      return NextResponse.json(
        { error: 'rate_limited' },
        { status: 429, headers: { 'Retry-After': String(retryAfter), 'Cache-Control': 'no-store' } },
      )
    }
  }

  if (pathname.startsWith('/api/') || pathname.startsWith('/go/')) return NextResponse.next()

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp(nonce, { dev: process.env.NODE_ENV === 'development' })
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)
  const res = NextResponse.next({ request: { headers: requestHeaders } })
  res.headers.set('Content-Security-Policy', csp)
  return res
}

export function pickPolicy(pathname: string, method: string): Policy | null {
  if (pathname.startsWith('/go/')) return 'affiliateRedirect'
  if (pathname.startsWith('/api/auth/')) {
    if (method !== 'POST') return null
    return pathname.startsWith('/api/auth/signin/nodemailer') ? 'authEmail' : 'authGeneric'
  }
  if (pathname.startsWith('/api/quiz')) return 'quiz'
  if (pathname.startsWith('/api/')) return 'apiDefault'
  return null
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico|woff2?)$).*)',
      missing: [{ type: 'header', key: 'next-router-prefetch' }, { type: 'header', key: 'purpose', value: 'prefetch' }],
    },
  ],
}
