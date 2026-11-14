import { describe, expect, it } from 'vitest'
import { isCrossSiteAllowed, isSameOrigin, isStateChanging } from '@/server/security/origin'

const ORIGIN = 'https://tresser.fr'
const h = (init: Record<string, string>) => new Headers(init)

describe('origin check (CSRF)', () => {
  it('accepts same origin', () => {
    expect(isSameOrigin(h({ origin: ORIGIN }), ORIGIN)).toBe(true)
    expect(isSameOrigin(h({ referer: `${ORIGIN}/connexion` }), ORIGIN)).toBe(true)
  })

  it('rejects foreign, look-alike, null or missing origins', () => {
    expect(isSameOrigin(h({ origin: 'https://evil.com' }), ORIGIN)).toBe(false)
    expect(isSameOrigin(h({ origin: 'https://tresser.fr.evil.com' }), ORIGIN)).toBe(false)
    expect(isSameOrigin(h({ origin: 'http://tresser.fr' }), ORIGIN)).toBe(false)
    expect(isSameOrigin(h({ origin: 'null' }), ORIGIN)).toBe(false)
    expect(isSameOrigin(h({}), ORIGIN)).toBe(false)
    expect(isSameOrigin(h({ referer: 'not a url' }), ORIGIN)).toBe(false)
  })

  it('origin header wins over a spoofable referer', () => {
    expect(isSameOrigin(h({ origin: 'https://evil.com', referer: `${ORIGIN}/` }), ORIGIN)).toBe(false)
  })

  it('classifies methods and cross-site exemptions', () => {
    expect(isStateChanging('GET')).toBe(false)
    expect(isStateChanging('post')).toBe(true)
    expect(isCrossSiteAllowed('/api/auth/callback/apple')).toBe(true)
    expect(isCrossSiteAllowed('/api/auth/callback/google')).toBe(false)
    expect(isCrossSiteAllowed('/api/webhooks/stripe')).toBe(true)
    expect(isCrossSiteAllowed('/api/quiz')).toBe(false)
  })
})

describe('allowed origins (Vercel previews)', () => {
  it('accepts any of the configured origins only', () => {
    const allowed = ['https://tresser.fr', 'https://tresser-git-main-team.vercel.app']
    expect(isSameOrigin(new Headers({ origin: 'https://tresser-git-main-team.vercel.app' }), allowed)).toBe(true)
    expect(isSameOrigin(new Headers({ origin: 'https://evil.vercel.app' }), allowed)).toBe(false)
  })

  it('builds the list from APP_URL and Vercel system variables', async () => {
    const { allowedOrigins, appUrl } = await import('@/server/security/app-origin')
    const prev = { ...process.env }
    process.env.APP_URL = ''
    process.env.VERCEL_BRANCH_URL = 'tresser-git-x-team.vercel.app'
    process.env.VERCEL_URL = 'tresser-abc123-team.vercel.app'
    expect(appUrl()).toBe('https://tresser-git-x-team.vercel.app')
    expect(allowedOrigins()).toEqual(['https://tresser-git-x-team.vercel.app', 'https://tresser-abc123-team.vercel.app'])
    process.env = prev
  })
})
