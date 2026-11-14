import { describe, expect, it } from 'vitest'
import { pickPolicy } from '@/proxy'
import { clientIp, createMemoryLimiter, POLICIES } from '@/server/security/ratelimit'

describe('memory limiter', () => {
  it('blocks after the quota and resets after the window', async () => {
    let t = 0
    const l = createMemoryLimiter(() => t)
    const quota = POLICIES.authEmail.tokens
    for (let i = 0; i < quota; i++) expect((await l.limit('authEmail', 'k')).success).toBe(true)
    expect((await l.limit('authEmail', 'k')).success).toBe(false)
    expect((await l.limit('authEmail', 'other')).success).toBe(true)
    t += 15 * 60_000
    expect((await l.limit('authEmail', 'k')).success).toBe(true)
  })
})

describe('policy routing', () => {
  it('maps sensitive endpoints to their policy', () => {
    expect(pickPolicy('/api/auth/signin/nodemailer', 'POST')).toBe('authEmail')
    expect(pickPolicy('/api/auth/callback/google', 'POST')).toBe('authGeneric')
    expect(pickPolicy('/api/auth/session', 'GET')).toBeNull()
    expect(pickPolicy('/go/abc', 'GET')).toBe('affiliateRedirect')
    expect(pickPolicy('/api/quiz', 'POST')).toBe('quiz')
    expect(pickPolicy('/produits', 'GET')).toBeNull()
  })
})

describe('clientIp', () => {
  it('prefers the edge-set x-real-ip', () => {
    expect(clientIp(new Headers({ 'x-real-ip': '1.1.1.1', 'x-forwarded-for': '6.6.6.6, 1.1.1.1' }))).toBe('1.1.1.1')
    expect(clientIp(new Headers({ 'x-forwarded-for': '2.2.2.2, 10.0.0.1' }))).toBe('2.2.2.2')
    expect(clientIp(new Headers())).toBe('0.0.0.0')
  })
})
