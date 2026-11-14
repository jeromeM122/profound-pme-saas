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
  const profile = await getVisitorProfile()
  const rows = PRODUCTS.filter((p) => !active || p.categories.includes(active)).map((p, i) => ({
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
