import { describe, expect, it } from 'vitest'
import { buildCsp } from '@/server/security/csp'

const directive = (csp: string, name: string) => csp.split('; ').find((d) => d.startsWith(`${name} `) || d === name)

describe('CSP', () => {
  const prod = buildCsp('abc', { dev: false })

  it('uses nonce + strict-dynamic and never unsafe-inline/eval in prod', () => {
    expect(directive(prod, 'script-src')).toBe("script-src 'self' 'nonce-abc' 'strict-dynamic'")
    expect(directive(prod, 'style-src')).toBe("style-src 'self' 'nonce-abc'")
    expect(directive(prod, 'style-src-attr')).toBe("style-src-attr 'unsafe-inline'")
    expect(directive(prod, 'script-src')).not.toContain('unsafe-inline')
    expect(prod).not.toContain('unsafe-eval')
  })

  it('only allows the three whitelisted video players in frames', () => {
    expect(directive(prod, 'frame-src')).toBe(
      'frame-src https://www.tiktok.com https://www.instagram.com https://www.youtube-nocookie.com',
    )
  })

  it('locks down framing, plugins and base-uri', () => {
    expect(directive(prod, 'frame-ancestors')).toBe("frame-ancestors 'none'")
    expect(directive(prod, 'object-src')).toBe("object-src 'none'")
    expect(directive(prod, 'base-uri')).toBe("base-uri 'self'")
    expect(prod).toContain('upgrade-insecure-requests')
  })

  it('allows eval only in dev', () => {
    expect(buildCsp('n', { dev: true })).toContain("'unsafe-eval'")
  })
})
