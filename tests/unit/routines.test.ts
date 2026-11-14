import { describe, expect, it } from 'vitest'
import { categoryFromSlug, getRoutine, matchRoutine, outboundUrl, rankRoutines, ROUTINES } from '@/content/routines'

describe('routine content', () => {
  it('has 20 complete routines with steps and images', () => {
    expect(ROUTINES).toHaveLength(20)
    for (const r of ROUTINES) {
      expect(r.slug).toMatch(/^[a-z0-9-]+$/)
      expect(r.steps.length).toBeGreaterThan(0)
      expect(r.hero?.src ?? r.heroMobile?.src).toMatch(/^\/routines\//)
      for (const s of r.steps) if (s.buy) expect(s.buy.url).toMatch(/^https?:\/\//)
    }
  })
})

describe('matching', () => {
  const cindy = getRoutine('cindy')!
  it('scores an exact crépus + hydration profile highest', () => {
    const m = matchRoutine(cindy, { texture: 'T4C', porosity: 'HIGH', goals: ['HYDRATION'] })
    expect(m.score).toBeGreaterThanOrEqual(75)
    expect(m.label).toBe('Très proche de ton profil')
  })
  it('scores a straight-hair profile low', () => {
    expect(matchRoutine(cindy, { texture: 'T1A', porosity: 'LOW', goals: ['VOLUME'] }).score).toBeLessThan(50)
  })
  it('ranks routines for a profile, keeps original order without one', () => {
    const ranked = rankRoutines({ texture: 'T3B', porosity: 'MEDIUM', goals: ['DEFINITION'] })
    expect(ranked[0]!.match!.score).toBeGreaterThanOrEqual(ranked.at(-1)!.match!.score)
    expect(ranked[0]!.routine.categories).toContain('BOUCLES')
    expect(rankRoutines(null).map((r) => r.routine.slug)).toEqual(ROUTINES.map((r) => r.slug))
  })
})

describe('outbound links', () => {
  it('adds UTM to brand shops, not to social networks, and rejects other schemes', () => {
    expect(outboundUrl('https://shop.example/p?x=1', 'cindy')).toBe('https://shop.example/p?x=1&utm_source=tresser&utm_medium=routine&utm_campaign=cindy')
    expect(outboundUrl('https://www.instagram.com/misslubin.hp/', 'cindy')).toBe('https://www.instagram.com/misslubin.hp/')
    expect(outboundUrl('javascript:alert(1)', 'cindy')).toBe('#')
  })
  it('maps category slugs', () => {
    expect(categoryFromSlug('crepus')).toBe('CREPUS')
    expect(categoryFromSlug('nope')).toBeNull()
  })
})
