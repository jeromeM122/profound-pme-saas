import { BudgetTier, HairGoal, HairTexture, Porosity, ScalpType } from '@/generated/prisma/enums'
import type { WaveName } from '@/components/brand/wave-paths'

/** Quiz content (French copy) — shared by the client quiz and server rendering. */

export const TEXTURE_FAMILIES = [
  { family: '1', title: 'Raides', hint: 'Pas d’ondulation, ils retombent droit.', wave: 'swell' },
  { family: '2', title: 'Ondulés', hint: 'Des vagues en S, sans boucle fermée.', wave: 'wave' },
  { family: '3', title: 'Bouclés', hint: 'Des boucles définies, en spirale.', wave: 'tight' },
  { family: '4', title: 'Frisés / crépus', hint: 'Des boucles très serrées, en Z ou en ressort.', wave: 'curl' },
] as const satisfies readonly { family: string; title: string; hint: string; wave: WaveName }[]

export type TextureFamily = (typeof TEXTURE_FAMILIES)[number]['family']

export const TEXTURES: Record<HairTexture, { code: string; label: string; family: TextureFamily }> = {
  T1A: { code: '1A', label: 'Raides fins', family: '1' },
  T1B: { code: '1B', label: 'Raides avec corps', family: '1' },
  T1C: { code: '1C', label: 'Raides épais', family: '1' },
  T2A: { code: '2A', label: 'Ondulés légers', family: '2' },
  T2B: { code: '2B', label: 'Ondulés marqués', family: '2' },
  T2C: { code: '2C', label: 'Ondulés épais', family: '2' },
  T3A: { code: '3A', label: 'Boucles larges', family: '3' },
  T3B: { code: '3B', label: 'Boucles ressort', family: '3' },
  T3C: { code: '3C', label: 'Boucles serrées', family: '3' },
  T4A: { code: '4A', label: 'Frisés serrés', family: '4' },
  T4B: { code: '4B', label: 'Crépus en Z', family: '4' },
  T4C: { code: '4C', label: 'Crépus très serrés', family: '4' },
}

export const POROSITY: Record<Porosity, { label: string; answer: string; short: string }> = {
  HIGH: { label: 'Haute porosité', short: 'Haute', answer: 'Très vite — ils absorbent tout, mais se dessèchent aussi vite.' },
  MEDIUM: { label: 'Porosité moyenne', short: 'Moyenne', answer: 'En quelques heures, sans difficulté particulière.' },
  LOW: { label: 'Faible porosité', short: 'Faible', answer: 'Très lentement — les produits restent en surface.' },
  UNKNOWN: { label: 'Porosité à découvrir', short: 'À découvrir', answer: 'Je ne sais pas.' },
}

export const SCALP: Record<ScalpType, { label: string; hint: string }> = {
  DRY: { label: 'Sec', hint: 'Tiraillements, petites pellicules sèches.' },
  BALANCED: { label: 'Équilibré', hint: 'Rien à signaler.' },
  OILY: { label: 'Gras', hint: 'Racines vite grasses.' },
  SENSITIVE: { label: 'Sensible', hint: 'Réagit facilement aux produits.' },
}

export const GOALS: Record<HairGoal, { label: string; routine: string }> = {
  HYDRATION: { label: 'Hydratation', routine: 'Routine Hydratation' },
  GROWTH: { label: 'Pousse & longueur', routine: 'Routine Pousse' },
  DEFINITION: { label: 'Définition des boucles', routine: 'Routine Définition' },
  REPAIR: { label: 'Réparation', routine: 'Routine Réparation' },
  VOLUME: { label: 'Volume', routine: 'Routine Volume' },
  PROTECTIVE_STYLES: { label: 'Coiffures protectrices', routine: 'Routine Protectrice' },
  SCALP_CARE: { label: 'Soin du cuir chevelu', routine: 'Routine Cuir chevelu' },
}

export const BUDGET: Record<BudgetTier, { label: string; hint: string }> = {
  LOW: { label: 'Malin', hint: 'Moins de 15 € par produit' },
  MID: { label: 'Équilibré', hint: '15 à 30 € par produit' },
  PREMIUM: { label: 'Premium', hint: 'Plus de 30 € par produit' },
}

export const MAX_GOALS = 3

export const ENUMS = { HairTexture, Porosity, ScalpType, HairGoal, BudgetTier }
