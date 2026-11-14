import type { Metadata } from 'next'
import Link from 'next/link'
import { ProductCard } from '@/components/products/ProductCard'
import { ButtonLabel } from '@/components/ui/ButtonLabel'
import { PRODUCTS } from '@/content/catalog'
import { CATEGORY_LABEL, CATEGORY_SLUG, categoryFromSlug, scoreFit, type RoutineCategory } from '@/content/routines'
import { getVisitorProfile } from '@/server/hair/visitor-profile'

export const metadata: Metadata = {
  title: 'Les produits de la communauté',
  description: 'Les soins réellement utilisés dans les routines de la communauté tresser.fr, et où les acheter.',
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }
const CATEGORIES = Object.keys(CATEGORY_LABEL) as RoutineCategory[]

export default async function ProduitsPage({ searchParams }: Props) {
  const sp = await searchParams
  const active = categoryFromSlug(typeof sp.texture === 'string' ? sp.texture : undefined)
  const q = typeof sp.q === 'string' ? sp.q.trim().slice(0, 60) : ''
  const norm = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const terms = norm(q).split(/\s+/).filter(Boolean)
  const profile = await getVisitorProfile()
  const haystack = (p: (typeof PRODUCTS)[number]) => norm([p.name, p.brand, p.descriptor, p.offer?.merchantName, ...p.usages.map((u) => u.stepName)].filter(Boolean).join(' '))
  const rows = PRODUCTS.filter((p) => (!active || p.categories.includes(active)) && terms.every((t) => haystack(p).includes(t))).map((p, i) => ({
    p,
    i,
    match: profile ? scoreFit({ textures: p.textures, goals: p.goals, porosity: null }, profile) : null,
  }))
  // Personal fit first, then social proof (number of routines using the product).
  rows.sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0) || b.p.usages.length - a.p.usages.length || a.i - b.i)
  const chip = (on: boolean) =>
    `kicker whitespace-nowrap border px-4 py-2.5 text-[0.62rem] transition-colors ${on ? 'border-encre bg-encre text-creme' : 'border-ligne text-encre hover:border-or hover:text-or'}`

  return (
    <div className="pb-24">
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pt-16 pb-10 text-center sm:px-8">
        <p className="kicker text-or">Approuvés par la communauté</p>
        <h1 className="display text-4xl sm:text-6xl">
          Les soins <span className="accent">qui ont fait leurs preuves</span>
        </h1>
        <p className="mx-auto max-w-xl leading-relaxed text-taupe">
          {PRODUCTS.length} produits utilisés dans de vraies routines — {profile ? 'classés pour ton profil' : 'classés par popularité'}.
        </p>
        {!profile && (
          <div className="mt-2 flex justify-center">
            <Link href="/diagnostic" className="btn-ghost">
              <ButtonLabel>Voir ceux faits pour moi</ButtonLabel>
            </Link>
          </div>
        )}
      </section>

      <form role="search" action="/produits" className="mx-auto mb-8 flex max-w-xl items-end gap-3 px-4">
        {active && <input type="hidden" name="texture" value={CATEGORY_SLUG[active]} />}
        <label htmlFor="q" className="sr-only">Rechercher un produit, une marque, une étape</label>
        <input id="q" name="q" type="search" defaultValue={q} maxLength={60} placeholder="Shampoing, masque, Activilong…" className="field" />
        <button className="btn-primary min-h-11 shrink-0 px-5">Rechercher</button>
      </form>

      <nav aria-label="Filtrer par texture" className="mx-auto max-w-7xl px-4 sm:px-8">
        <ul className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center">
          <li>
            <Link href="/produits" className={chip(!active)} aria-current={!active ? 'page' : undefined}>Tous</Link>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c}>
              <Link href={`/produits?texture=${CATEGORY_SLUG[c]}` as '/produits'} className={chip(active === c)} aria-current={active === c ? 'page' : undefined}>
                {CATEGORY_LABEL[c]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {q && (
        <p className="mx-auto mt-8 max-w-7xl px-4 text-sm text-taupe sm:px-8">
          {rows.length} résultat{rows.length > 1 ? 's' : ''} pour « {q} » ·{' '}
          <Link href={active ? (`/produits?texture=${CATEGORY_SLUG[active]}` as '/produits') : '/produits'} className="underline underline-offset-4 hover:text-or">
            effacer
          </Link>
        </p>
      )}
      {rows.length === 0 && (
        <div className="mx-auto mt-10 grid max-w-md justify-items-center gap-4 px-4 text-center">
          <p className="text-lg">Aucun produit ne correspond.</p>
          <Link href="/routines" className="btn-ghost">Explorer les routines</Link>
        </div>
      )}
      <ul className="mx-auto mt-10 grid max-w-7xl grid-cols-2 gap-x-4 gap-y-10 px-4 sm:px-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
        {rows.map(({ p, match }) => (
          <li key={p.slug}>
            <ProductCard product={p} match={match} />
          </li>
        ))}
      </ul>
    </div>
  )
}
