import type { HairGoal, HairTexture, Porosity } from '@/generated/prisma/enums'
import { ROUTINES_DATA } from './routines.data'

export type RoutineImage = { src: string; w: number; h: number }
export type RoutineCategory = 'CREPUS' | 'BOUCLES' | 'FRISES' | 'LOCS' | 'MULTI'
export type RoutineStep = {
  n: number
  name: string
  brand: string
  text: string[]
  image?: RoutineImage | null
  buy?: { url: string; label: string; merchant: string } | null
}
export type RoutineData = {
  slug: string
  name: string
  title: string
  quote: string
  kicker: string
  highlights: string[]
  hairDescription: string | null
  problem: string | null
  story: string[]
  categories: RoutineCategory[]
  textures: HairTexture[]
  goals: HairGoal[]
  porosity: Porosity | null
  hero?: RoutineImage | null
  heroMobile?: RoutineImage | null
  steps: RoutineStep[]
  sourceUrl: string
}

export const CATEGORY_LABEL: Record<RoutineCategory, string> = {
  CREPUS: 'Cheveux crépus',
  BOUCLES: 'Cheveux bouclés',
  FRISES: 'Cheveux frisés',
  LOCS: 'Locs',
  MULTI: 'Multi-textures',
}
export const CATEGORY_SLUG: Record<RoutineCategory, string> = {
  CREPUS: 'crepus',
  BOUCLES: 'boucles',
  FRISES: 'frises',
  LOCS: 'locs',
  MULTI: 'multi-textures',
}
export function categoryFromSlug(slug: string | undefined): RoutineCategory | null {
  const hit = (Object.entries(CATEGORY_SLUG) as [RoutineCategory, string][]).find(([, s]) => s === slug)
  return hit ? hit[0] : null
}

export const ROUTINES: readonly RoutineData[] = ROUTINES_DATA

export function getRoutine(slug: string): RoutineData | undefined {
  return ROUTINES.find((r) => r.slug === slug)
}

export function routineBrands(r: RoutineData): string[] {
  return [...new Set(r.steps.map((s) => s.buy?.merchant).filter((m): m is string => Boolean(m) && m !== 'instagram.com'))]
}

/** Adds UTM parameters so partner brands can attribute the visit (never on social networks). */
export function outboundUrl(url: string, slug: string): string {
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return '#'
    if (/(^|\.)instagram\.com$|(^|\.)tiktok\.com$/.test(u.hostname)) return u.toString()
    u.searchParams.set('utm_source', 'tresser')
    u.searchParams.set('utm_medium', 'routine')
    u.searchParams.set('utm_campaign', slug)
    return u.toString()
  } catch {
    return '#'
  }
}

export function merchantLabel(host: string): string {
  return host.replace(/^(www\.|fr\.)/, '')
}

// ─── Personalisation ─────────────────────────────────────────────────────────

export type Profile = { texture: HairTexture; porosity: Porosity; goals: HairGoal[] }
export type Match = { score: number; label: string }

/**
 * How close a routine is to the visitor's diagnostic (0–100). Transparent heuristic:
 *  texture 60 (exact family member) / 35 (same family) / 30 (style-based routine, e.g. locs)
 *  porosity 15 (same) / 7 (routine not porosity-specific)
 *  goals 25 × share of the visitor's goals the routine addresses (7 if the routine has no stated goal)
 */
export function matchRoutine(r: RoutineData, p: Profile): Match {
  return scoreFit(r, p)
}

/** Same heuristic for anything that declares textures / goals / porosity (routines, products). */
export function scoreFit(r: { textures: HairTexture[]; goals: HairGoal[]; porosity: Porosity | null }, p: Profile): Match {
  let score = 0
  if (r.textures.length === 0) score += 30
  else if (r.textures.includes(p.texture)) score += 60
  else if (r.textures.some((t) => t[1] === p.texture[1])) score += 35

  if (!r.porosity || p.porosity === 'UNKNOWN') score += 7
  else if (r.porosity === p.porosity) score += 15

  if (r.goals.length === 0) score += 7
  else if (p.goals.length > 0) {
    const shared = p.goals.filter((g) => r.goals.includes(g)).length
    score += Math.round(25 * Math.min(1, shared / Math.min(p.goals.length, r.goals.length)))
  }
  score = Math.min(100, score)
  const label = score >= 75 ? 'Très proche de ton profil' : score >= 50 ? 'Proche de ton profil' : 'Une autre approche'
  return { score, label }
}

export function rankRoutines(p: Profile | null, list: readonly RoutineData[] = ROUTINES) {
  const rows = list.map((r, i) => ({ routine: r, match: p ? matchRoutine(r, p) : null, i }))
  if (p) rows.sort((a, b) => b.match!.score - a.match!.score || a.i - b.i)
  return rows
}
