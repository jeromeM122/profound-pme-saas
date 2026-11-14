import type { HairGoal, HairTexture } from '@/generated/prisma/enums'
import { ROUTINES, type RoutineCategory, type RoutineData, type RoutineImage } from './routines'

/**
 * Product catalogue derived from the community routines (single source of truth for the seed
 * and for the pages). Products are deduplicated by their shop URL, so a product used in several
 * routines has one page gathering every testimonial.
 */

/** Shops that are the brand's own e-shop (vs. multi-brand retailers). */
const BRAND_BY_HOST: Record<string, string> = {
  'secretsdeloly.com': 'Les Secrets de Loly',
  'mangobutterfull.com': 'Mango Butterfull',
  'activilong.com': 'Activilong',
  'kevinmurphy.com.au': 'Kevin Murphy',
  'kalianature.com': 'Kalia Nature',
  'lorealprofessionnel.fr': 'L’Oréal Professionnel',
  'inhaircare.co': 'Inhaircare',
  'fr.topicrem.com': 'Topicrem',
  'evashair.fr': 'Evashair',
  'cutbyfred.com': 'Cut by Fred',
  'curlsvitamins.com': 'Curls Vitamins',
  'noireonaturel.com': 'Noire ô Naturel',
  'labelleboucle.fr': 'La Belle Boucle',
  'instagram.com': 'Miss Lubin',
}

const MERCHANT_NAME: Record<string, string> = {
  'colorfulblack.com': 'Colorful Black',
  'shandraniparis.fr': 'Shandrani Paris',
  'mademoiselle-bio.com': 'Mademoiselle Bio',
  'lookfantastic.fr': 'Lookfantastic',
  'diouda.fr': 'Diouda',
  'pomelo-co.fr': 'Pomelo+Co',
  'bleulibellule.com': 'Bleu Libellule',
}

export type Usage = { routineSlug: string; routineName: string; step: number; stepName: string; text: string[] }
export type Offer = { id: string; merchantSlug: string; merchantName: string; host: string; url: string; isBrandShop: boolean }
export type CatalogProduct = {
  slug: string
  name: string
  descriptor: string | null
  brand: string | null
  image: RoutineImage | null
  offer: Offer | null
  usages: Usage[]
  categories: RoutineCategory[]
  textures: HairTexture[]
  goals: HairGoal[]
}

export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Deterministic, URL-safe short hash (FNV-1a 32-bit ×2) — stable ids without a DB round-trip. */
export function shortHash(s: string): string {
  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (let i = 0; i < s.length; i++) {
    h1 = Math.imul(h1 ^ s.charCodeAt(i), 16777619) >>> 0
    h2 = Math.imul(h2 ^ s.charCodeAt(i), 2246822519) >>> 0
  }
  return (h1.toString(36) + h2.toString(36)).padEnd(12, '0').slice(0, 12)
}

function normalizeUrl(url: string): string {
  const u = new URL(url)
  return `${u.hostname.replace(/^www\./, '')}${u.pathname.replace(/\/$/, '')}`
}

export function merchantFor(host: string) {
  const h = host.replace(/^www\./, '')
  const brand = BRAND_BY_HOST[h]
  return { slug: slugify(h), name: brand ?? MERCHANT_NAME[h] ?? h, host: h, isBrandShop: Boolean(brand) }
}

function build(routines: readonly RoutineData[]) {
  const byKey = new Map<string, CatalogProduct>()
  const stepIndex = new Map<string, string>() // `${routine}#${n}` → product slug
  const usedSlugs = new Set<string>()

  for (const r of routines) {
    for (const s of r.steps) {
      const name = (s.brand || s.name).trim()
      const key = s.buy ? normalizeUrl(s.buy.url) : `${r.slug}#${s.n}`
      let p = byKey.get(key)
      if (!p) {
        const host = s.buy ? new URL(s.buy.url).hostname.replace(/^www\./, '') : null
        const m = host ? merchantFor(host) : null
        let slug = slugify(`${name}-${m?.isBrandShop ? m.name : ''}`) || slugify(key)
        if (usedSlugs.has(slug)) slug = `${slug}-${shortHash(key).slice(0, 4)}`
        usedSlugs.add(slug)
        p = {
          slug,
          name,
          descriptor: s.brand && s.name && s.name !== s.brand ? s.name : null,
          brand: m?.isBrandShop ? m.name : null,
          image: s.image ?? null,
          offer:
            s.buy && m
              ? { id: `off_${shortHash(`${slug}|${m.slug}`)}`, merchantSlug: m.slug, merchantName: m.name, host: m.host, url: s.buy.url, isBrandShop: m.isBrandShop }
              : null,
          usages: [],
          categories: [],
          textures: [],
          goals: [],
        }
        byKey.set(key, p)
      }
      p.usages.push({ routineSlug: r.slug, routineName: r.name, step: s.n, stepName: s.name, text: s.text })
      p.categories = [...new Set([...p.categories, ...r.categories])]
      p.textures = [...new Set([...p.textures, ...r.textures])]
      p.goals = [...new Set([...p.goals, ...r.goals])]
      stepIndex.set(`${r.slug}#${s.n}`, p.slug)
    }
  }
  return { products: [...byKey.values()], stepIndex }
}

const BUILT = build(ROUTINES)
export const PRODUCTS: readonly CatalogProduct[] = BUILT.products

export function getProduct(slug: string): CatalogProduct | undefined {
  return PRODUCTS.find((p) => p.slug === slug)
}

export function productForStep(routineSlug: string, step: number): CatalogProduct | undefined {
  const slug = BUILT.stepIndex.get(`${routineSlug}#${step}`)
  return slug ? getProduct(slug) : undefined
}

/** Tracked outbound link through /go (click logged server-side, then 302 to the shop). */
export function goHref(offer: Offer, from: string): string {
  return `/go/${offer.id}?from=${encodeURIComponent(from)}`
}
