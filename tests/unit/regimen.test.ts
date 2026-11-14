import { describe, expect, it } from 'vitest'
import { PRODUCTS } from '@/content/catalog'
import { buildRegimen, classifyProduct, classifyText, plannedSteps, shoppingList, STEP_ORDER, weeklyRitual } from '@/content/regimen'
import type { Profile } from '@/content/routines'

const coily: Profile = { texture: 'T4C', porosity: 'HIGH', goals: ['HYDRATION'] }
const wavy: Profile = { texture: 'T2B', porosity: 'LOW', goals: ['VOLUME'] }

describe('step classification', () => {
  it('classifies common step names', () => {
    expect(classifyText('Après shampoing Les Secrets de Loly')).toBe('CONDITION')
    expect(classifyText('Shampoing doux')).toBe('CLEANSE')
    expect(classifyText('Pré shampoing')).toBe('PRE_POO')
    expect(classifyText('Masque réparateur')).toBe('MASK')
    expect(classifyText('Leave In Activilong')).toBe('LEAVE_IN')
    expect(classifyText("Huile de ricin et d'avocat")).toBe('SEAL')
    expect(classifyText('Gelée capillaire')).toBe('STYLE')
    expect(classifyText('Diffuseur')).toBeNull()
  })
  it('classifies most of the catalogue', () => {
    const classified = PRODUCTS.filter((p) => classifyProduct(p)).length
    expect(classified / PRODUCTS.length).toBeGreaterThan(0.7)
  })
})

describe('regimen', () => {
  it('adapts steps to the profile and keeps the canonical order', () => {
    const c = plannedSteps(coily).map((s) => s.type)
    expect(c).toEqual(expect.arrayContaining(['PRE_POO', 'CLEANSE', 'CONDITION', 'MASK', 'LEAVE_IN', 'SEAL']))
    expect(c).toEqual([...c].sort((a, b) => STEP_ORDER.indexOf(a) - STEP_ORDER.indexOf(b)))
    const w = plannedSteps(wavy).map((s) => s.type)
    expect(w).toContain('STYLE')
    expect(w).not.toContain('SEAL')
    expect(w).not.toContain('PRE_POO')
  })
  it('picks a buyable, well-matched product per step with alternatives', () => {
    const r = buildRegimen(coily)
    for (const s of r) {
      expect(s.pick).not.toBeNull()
      expect(s.alternatives).not.toContain(s.pick)
    }
    expect(r.find((s) => s.type === 'CLEANSE')!.pick!.product.offer).not.toBeNull()
  })
  it('honours a saved choice when valid and ignores an invalid one', () => {
    const auto = buildRegimen(coily)
    const alt = auto.find((s) => s.type === 'MASK')!.alternatives[0]!.product.slug
    expect(buildRegimen(coily, { MASK: alt }).find((s) => s.type === 'MASK')!.pick!.product.slug).toBe(alt)
    expect(buildRegimen(coily, { MASK: 'nope' }).find((s) => s.type === 'MASK')!.pick).toEqual(auto.find((s) => s.type === 'MASK')!.pick)
  })
  it('builds a shopping list without owned products, grouped by shop', () => {
    const r = buildRegimen(coily)
    const all = shoppingList(r, new Set())
    const owned = new Set([r[1]!.pick!.product.slug])
    const fewer = shoppingList(r, owned)
    const count = (g: typeof all) => g.reduce((n, x) => n + x.items.length, 0)
    expect(count(fewer)).toBeLessThan(count(all))
    expect(all.every((g) => g.items.every((i) => i.product.offer))).toBe(true)
  })
  it('plans one wash day per week for coily hair', () => {
    const { plan } = weeklyRitual(coily)
    expect(plan.filter((d) => d.kind === 'wash')).toHaveLength(1)
    expect(plan).toHaveLength(7)
  })
})
