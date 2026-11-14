import type { Metadata } from 'next'
import Link from 'next/link'
import { HairBadge } from '@/components/profile/HairBadge'
import { RoutineCard } from '@/components/routines/RoutineCard'
import { ButtonLabel } from '@/components/ui/ButtonLabel'
import { CATEGORY_LABEL, CATEGORY_SLUG, categoryFromSlug, rankRoutines, ROUTINES, type RoutineCategory } from '@/content/routines'
import { getVisitorProfile } from '@/server/hair/visitor-profile'

export const metadata: Metadata = {
  title: 'Routines capillaires testées IRL',
  description: 'Les routines de la communauté tresser.fr : cheveux crépus, bouclés, frisés, locs et multi-textures. Les produits qui fonctionnent vraiment, étape par étape.',
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }
const CATEGORIES = Object.keys(CATEGORY_LABEL) as RoutineCategory[]
const SHARE_FORM = 'https://tally.so/r/mY7zoq'

export default async function RoutinesPage({ searchParams }: Props) {
  const sp = await searchParams
  const active = categoryFromSlug(typeof sp.texture === 'string' ? sp.texture : undefined)
  const profile = await getVisitorProfile()
  const list = active ? ROUTINES.filter((r) => r.categories.includes(active)) : ROUTINES
  const ranked = rankRoutines(profile, list)
  const chip = (on: boolean) =>
    `kicker whitespace-nowrap border px-4 py-2.5 text-[0.62rem] transition-colors ${on ? 'border-encre bg-encre text-creme' : 'border-ligne text-encre hover:border-or hover:text-or'}`

  return (
    <div className="pb-24">
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pt-16 pb-12 text-center sm:px-8">
        <p className="kicker text-or">Testées IRL par la communauté</p>
        <h1 className="display text-4xl sm:text-6xl">
          Les routines <span className="accent">qui marchent</span>
        </h1>
        <p className="mx-auto max-w-xl leading-relaxed text-taupe">
          {ROUTINES.length} routines partagées étape par étape, avec les produits utilisés et où les acheter.
        </p>
      </section>

      {/* Personalisation banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8">
        {profile ? (
          <div className="flex flex-col items-center justify-center gap-3 border-y border-ligne py-5 text-center sm:flex-row">
            <p className="kicker text-[0.62rem] text-taupe">Triées pour ton profil</p>
            <HairBadge texture={profile.texture} porosity={profile.porosity} goals={profile.goals} size="sm" />
            <Link href="/diagnostic" className="kicker text-[0.58rem] text-taupe underline underline-offset-4 hover:text-or">
              Modifier
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 border border-or-clair bg-perle px-6 py-6 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
            <div className="grid gap-1">
              <p className="text-lg">Quelles routines sont faites pour toi ?</p>
              <p className="text-sm text-taupe">Fais ton diagnostic en 60 secondes : on classe les routines selon ta texture, ta porosité et tes objectifs.</p>
            </div>
            <Link href="/diagnostic" className="btn-primary shrink-0">
              <ButtonLabel>Voir mes routines</ButtonLabel>
            </Link>
          </div>
        )}
      </section>

      {/* Filters */}
      <nav aria-label="Filtrer par texture" className="mx-auto mt-10 max-w-7xl px-4 sm:px-8">
        <ul className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center">
          <li>
            <Link href="/routines" className={chip(!active)} aria-current={!active ? 'page' : undefined}>
              Toutes ({ROUTINES.length})
            </Link>
          </li>
          {CATEGORIES.map((c) => {
            const count = ROUTINES.filter((r) => r.categories.includes(c)).length
            return (
              <li key={c}>
                <Link href={`/routines?texture=${CATEGORY_SLUG[c]}` as '/routines'} className={chip(active === c)} aria-current={active === c ? 'page' : undefined}>
                  {CATEGORY_LABEL[c]} ({count})
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-8">
        <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {ranked.map(({ routine, match }, i) => (
            <li key={routine.slug}>
              <RoutineCard routine={routine} match={match} priority={i < 4} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-24 max-w-3xl px-4 text-center">
        <div className="grid justify-items-center gap-5 border-t border-ligne pt-16">
          <p className="kicker text-or">Et si tu participais ?</p>
          <p className="display text-3xl">
            Ta routine peut <span className="accent">aider quelqu’un</span>
          </p>
          <p className="max-w-lg text-taupe">Quelqu’un a les mêmes problématiques que toi et cherche encore. Partage les produits qui te conviennent.</p>
          <a href={SHARE_FORM} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            Partager ma routine <span aria-hidden>↗</span>
          </a>
        </div>
      </section>
    </div>
  )
}
