import { describe, expect, it } from 'vitest'
import { getProduct, goHref, PRODUCTS, productForStep, shortHash, slugify } from '@/content/catalog'
import { ROUTINES } from '@/content/routines'
import { buildDestination, isBot, OFFER_ID_RE, safeSourcePath } from '@/server/catalog/click'

describe('catalogue derived from routines', () => {
  it('maps every routine step to a product and dedupes shared shop links', () => {
    const steps = ROUTINES.reduce((n, r) => n + r.steps.length, 0)
    expect(PRODUCTS.length).toBeLessThan(steps)
    for (const r of ROUTINES) for (const s of r.steps) expect(productForStep(r.slug, s.n)).toBeDefined()
    const shared = PRODUCTS.filter((p) => p.usages.length > 1)
    expect(shared.length).toBeGreaterThan(0)
  })
  it('has unique slugs and offer ids in the expected format', () => {
    expect(new Set(PRODUCTS.map((p) => p.slug)).size).toBe(PRODUCTS.length)
    const ids = PRODUCTS.flatMap((p) => (p.offer ? [p.offer.id] : []))
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(OFFER_ID_RE)
  })
  it('is deterministic', () => {
    expect(shortHash('abc')).toBe(shortHash('abc'))
    expect(slugify('Crème « Curl » Expression — L’Oréal')).toBe('creme-curl-expression-l-oreal')
    const p = PRODUCTS.find((x) => x.offer)!
    expect(getProduct(p.slug)).toBe(p)
    expect(goHref(p.offer!, '/routines/cindy')).toBe(`/go/${p.offer!.id}?from=%2Froutines%2Fcindy`)
  })
})

describe('/go helpers', () => {
  const hosts = ['secretsdeloly.com', 'www.secretsdeloly.com']
  it('builds a tagged https destination on an allowed host', () => {
    const d = buildDestination('https://www.secretsdeloly.com/p/x?a=1', hosts, { campaign: 'cindy', clickId: 'c1', subIdParam: 'clickref' })
    expect(d).toBe('https://www.secretsdeloly.com/p/x?a=1&utm_source=tresser&utm_medium=referral&utm_campaign=cindy&clickref=c1')
  })
  it.each([
    'https://evil.com/x',
    'https://secretsdeloly.com.evil.com/x',
    'http://www.secretsdeloly.com/x',
    'https://user@www.secretsdeloly.com/x',
    'javascript:alert(1)',
    'not a url',
  ])('refuses %s', (u) => {
    expect(buildDestination(u, hosts, { campaign: 'c', clickId: 'x' })).toBeNull()
  })
  it('only accepts internal source paths', () => {
    expect(safeSourcePath('/routines/cindy')).toBe('/routines/cindy')
    expect(safeSourcePath('/produits')).toBe('/produits')
    for (const bad of ['https://evil.com', '//evil.com', '/routines/../admin', '/compte', null]) expect(safeSourcePath(bad)).toBe('/')
  })
  it('flags bots and empty user agents', () => {
    expect(isBot('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true)
    expect(isBot(null)).toBe(true)
    expect(isBot('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari/604.1')).toBe(false)
  })
})
