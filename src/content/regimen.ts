import { PRODUCTS, type CatalogProduct } from './catalog'
import { scoreFit, type Match, type Profile } from './routines'

/**
 * « Ma routine sur-mesure » engine (pure, deterministic, unit-tested).
 * Builds an ordered regimen from the visitor's diagnostic and picks, for each step, the best
 * community-proven product (personal fit + social proof + availability), with alternatives.
 */

export type StepType = 'PRE_POO' | 'CLEANSE' | 'CONDITION' | 'MASK' | 'LEAVE_IN' | 'SEAL' | 'STYLE'
export const STEP_ORDER: StepType[] = ['PRE_POO', 'CLEANSE', 'CONDITION', 'MASK', 'LEAVE_IN', 'SEAL', 'STYLE']

export const STEP_INFO: Record<StepType, { title: string; short: string }> = {
  PRE_POO: { title: 'Pré-shampoing', short: 'Protéger avant de laver' },
  CLEANSE: { title: 'Lavage', short: 'Nettoyer en douceur' },
  CONDITION: { title: 'Après-shampoing & démêlage', short: 'Démêler sans casser' },
  MASK: { title: 'Masque', short: 'Nourrir en profondeur' },
  LEAVE_IN: { title: 'Hydratation sans rinçage', short: 'Hydrater les longueurs' },
  SEAL: { title: 'Scellage', short: 'Garder l’hydratation' },
  STYLE: { title: 'Coiffage & définition', short: 'Définir et tenir' },
}

const RULES: [RegExp, StepType | 'TOOL'][] = [
  [/diffuseur|s[ée]cher|s[ée]choir/, 'TOOL'],
  [/pr[ée][- ]?shampo|bain d.huile/, 'PRE_POO'],
  [/apr[eè]s[- ]?shampo|rinse|d[ée]m[êe]l|conditioner/, 'CONDITION'],
  [/shampo|wash/, 'CLEANSE'],
  [/masque|mask|deep/, 'MASK'],
  [/leave[- ]?in|sans rin[çc]age|lait|cr[èe]me hydrat|spray|potion/, 'LEAVE_IN'],
  [/huile|beurre|karit[ée]|sceller|oil|nourish/, 'SEAL'],
  [/gel|coiffant|fouett[ée]e|souffl[ée]e|d[ée]finition|cr[èe]me|curl/, 'STYLE'],
]

/** Step type of a product, from how the community uses it. null = tool / unclassifiable. */
export function classifyProduct(p: CatalogProduct): StepType | null {
  for (const u of p.usages) {
    const t = classifyText(`${u.stepName} ${p.name}`)
    if (t) return t
  }
  return null
}
export function classifyText(text: string): StepType | null {
  const s = text.toLowerCase()
  for (const [re, t] of RULES) if (re.test(s)) return t === 'TOOL' ? null : t
  return null
}

const family = (p: Profile) => Number(p.texture[1])

/** Which steps this profile needs, each with a profile-specific reason. */
export function plannedSteps(p: Profile): { type: StepType; why: string }[] {
  const f = family(p)
  const high = p.porosity === 'HIGH'
  const low = p.porosity === 'LOW'
  const has = (g: Profile['goals'][number]) => p.goals.includes(g)
  const steps: { type: StepType; why: string }[] = []
  if ((f === 4 && high) || has('REPAIR') || has('GROWTH'))
    steps.push({ type: 'PRE_POO', why: 'Un bain d’huile avant le lavage limite le dessèchement et la casse de tes longueurs.' })
  steps.push({
    type: 'CLEANSE',
    why: p.goals.includes('SCALP_CARE')
      ? 'Ton cuir chevelu est la base : un shampoing doux, concentré sur les racines.'
      : f >= 3
        ? 'Un shampoing doux qui nettoie sans retirer l’hydratation dont tes boucles ont besoin.'
        : 'Un lavage léger, adapté à la fréquence de tes shampoings.',
  })
  steps.push({ type: 'CONDITION', why: f >= 3 ? 'Ta texture se démêle sur cheveux mouillés et enduits de soin, jamais à sec.' : 'Lisse la fibre et facilite le coiffage sans alourdir.' })
  steps.push({
    type: 'MASK',
    why: high ? 'Ta fibre est poreuse : un masque régulier comble ses besoins en eau et en nutrition.' : low ? 'Utilisé avec une chaleur douce, il pénètre mieux une fibre peu poreuse.' : 'Un soin profond pour garder des longueurs souples.',
  })
  steps.push({ type: 'LEAVE_IN', why: f >= 3 ? 'L’étape clé des cheveux texturés : de l’eau et du soin qui restent dans le cheveu.' : 'Une hydratation légère qui ne fait pas retomber la racine.' })
  if (high || f === 4 || has('HYDRATION'))
    steps.push({ type: 'SEAL', why: high ? 'Ta haute porosité laisse filer l’eau : une huile ou un beurre la retient (méthode LOC/LCO).' : 'Une huile ou un beurre pour sceller l’hydratation plusieurs jours.' })
  if (has('DEFINITION') || has('VOLUME') || f === 2 || f === 3)
    steps.push({ type: 'STYLE', why: has('VOLUME') ? 'Un coiffant léger pour du volume qui tient.' : 'Pour des boucles définies qui tiennent jusqu’au prochain lavage.' })
  return steps
}

export type Pick = { product: CatalogProduct; match: Match }
export type RegimenStep = { type: StepType; why: string; pick: Pick | null; alternatives: Pick[] }

function rankFor(type: StepType, p: Profile): Pick[] {
  return PRODUCTS.filter((x) => classifyProduct(x) === type)
    .map((x) => ({ product: x, match: scoreFit({ textures: x.textures, goals: x.goals, porosity: null }, p) }))
    .sort((a, b) => rank(b) - rank(a) || a.product.slug.localeCompare(b.product.slug))
}
const rank = (k: Pick) => k.match.score + 8 * Math.min(k.product.usages.length, 3) + (k.product.offer && !k.product.offer.host.includes('instagram') ? 10 : 0)

/** Full regimen; `choices` (step → product slug) overrides the automatic pick when still valid. */
export function buildRegimen(p: Profile, choices: Partial<Record<StepType, string>> = {}): RegimenStep[] {
  return plannedSteps(p).map(({ type, why }) => {
    const ranked = rankFor(type, p)
    const chosen = choices[type] ? ranked.find((k) => k.product.slug === choices[type]) : undefined
    const pick = chosen ?? ranked[0] ?? null
    return { type, why, pick, alternatives: ranked.filter((k) => k !== pick).slice(0, 3) }
  })
}

// ─── Weekly ritual ───────────────────────────────────────────────────────────

export const WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const
export type DayPlan = { day: (typeof WEEK)[number]; kind: 'wash' | 'refresh' | 'rest'; label: string }

export function weeklyRitual(p: Profile): { plan: DayPlan[]; summary: string } {
  const f = family(p)
  const wash = f === 4 ? [6] : f === 3 ? [2, 6] : [0, 2, 4]
  const refresh = f === 4 ? [2] : f === 3 ? [4] : []
  const plan = WEEK.map((day, i): DayPlan => {
    if (wash.includes(i)) return { day, kind: 'wash', label: 'Wash day' }
    if (refresh.includes(i)) return { day, kind: 'refresh', label: 'Rafraîchir' }
    return { day, kind: 'rest', label: 'Protéger la nuit' }
  })
  const summary =
    f === 4
      ? 'Un wash day par semaine, un rafraîchissement en milieu de semaine, et un foulard ou bonnet en satin chaque nuit.'
      : f === 3
        ? 'Deux lavages par semaine, un rafraîchissement entre les deux pour réveiller les boucles.'
        : 'Des lavages légers et réguliers ; le masque une fois par semaine suffit.'
  return { plan, summary }
}

/** Products of the regimen not yet owned, grouped by shop (fewer checkouts for the shopper). */
export function shoppingList(steps: RegimenStep[], owned: Set<string>) {
  const groups = new Map<string, { merchant: string; isBrandShop: boolean; items: { step: StepType; product: CatalogProduct }[] }>()
  for (const s of steps) {
    const prod = s.pick?.product
    if (!prod?.offer || owned.has(prod.slug)) continue
    const g = groups.get(prod.offer.merchantSlug) ?? { merchant: prod.offer.merchantName, isBrandShop: prod.offer.isBrandShop, items: [] }
    g.items.push({ step: s.type, product: prod })
    groups.set(prod.offer.merchantSlug, g)
  }
  return [...groups.values()].sort((a, b) => b.items.length - a.items.length)
}
