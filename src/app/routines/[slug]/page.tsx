import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Wave } from '@/components/brand/Wave'
import { BuyButton } from '@/components/routines/BuyButton'
import { HeroPicture } from '@/components/routines/HeroPicture'
import { MatchBadge } from '@/components/routines/MatchBadge'
import { RoutineCard } from '@/components/routines/RoutineCard'
import { ButtonLabel } from '@/components/ui/ButtonLabel'
import { CATEGORY_LABEL, CATEGORY_SLUG, getRoutine, matchRoutine, rankRoutines, ROUTINES, routineBrands } from '@/content/routines'
import { getVisitorProfile } from '@/server/hair/visitor-profile'

type Props = { params: Promise<{ slug: string }> }
const SHARE_FORM = 'https://tally.so/r/mY7zoq'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = getRoutine((await params).slug)
  if (!r) return { title: 'Routine introuvable', robots: { index: false } }
  return {
    title: `${r.title} — ${r.kicker}`,
    description: `${r.quote ? `« ${r.quote} » ` : ''}${r.steps.length} étapes et les produits utilisés par ${r.name}.`,
    openGraph: r.hero ? { images: [{ url: r.hero.src, width: r.hero.w, height: r.hero.h }] } : undefined,
  }
}

export default async function RoutinePage({ params }: Props) {
  const r = getRoutine((await params).slug)
  if (!r) notFound()
  const profile = await getVisitorProfile()
  const match = profile ? matchRoutine(r, profile) : null
  const buyable = r.steps.filter((s) => s.buy)
  const brands = routineBrands(r)
  const related = rankRoutines(
    profile,
    ROUTINES.filter((x) => x.slug !== r.slug && (profile ? true : x.categories.some((c) => r.categories.includes(c)))),
  ).slice(0, 4)
  const heroDesktop = r.hero ?? r.heroMobile
  const heroMobile = r.heroMobile ?? r.hero

  return (
    <div className="pb-24 lg:pb-0">
      {/* HERO */}
      <section className="relative isolate">
        {heroDesktop && heroMobile && (
          <HeroPicture desktop={heroDesktop} mobile={heroMobile} alt={`${r.name} présente sa routine capillaire`} className="h-[78svh] max-h-[760px] min-h-[460px] w-full object-cover" />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-encre/80 via-encre/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 text-creme sm:px-8 md:pb-14">
            <nav aria-label="Fil d’Ariane" className="kicker text-[0.6rem] text-creme/80">
              <Link href="/routines" className="hover:text-or-clair">Routines</Link>
              {r.categories[0] && (
                <>
                  {' / '}
                  <Link href={`/routines?texture=${CATEGORY_SLUG[r.categories[0]]}` as '/routines'} className="hover:text-or-clair">
                    {CATEGORY_LABEL[r.categories[0]]}
                  </Link>
                </>
              )}
            </nav>
            <h1 className="display text-4xl sm:text-6xl">{r.title}</h1>
            {r.quote && <p className="max-w-xl text-lg font-light text-creme/90 italic">« {r.quote} »</p>}
          </div>
        </div>
      </section>

      {/* KEY FACTS + personal fit */}
      <section className="border-b border-ligne bg-perle">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-10 gap-y-4 px-4 py-6 sm:px-8">
          <dl className="flex flex-wrap gap-x-10 gap-y-3">
            <div>
              <dt className="kicker text-[0.58rem] text-taupe">Routine</dt>
              <dd className="text-sm">{r.kicker}</dd>
            </div>
            {r.hairDescription && (
              <div>
                <dt className="kicker text-[0.58rem] text-taupe">Cheveux</dt>
                <dd className="text-sm">{r.hairDescription}</dd>
              </div>
            )}
            <div>
              <dt className="kicker text-[0.58rem] text-taupe">Étapes</dt>
              <dd className="text-sm">{r.steps.length}</dd>
            </div>
          </dl>
          <div className="ml-auto flex flex-wrap items-center gap-4">
            {match ? (
              <MatchBadge match={match} />
            ) : (
              <Link href="/diagnostic" className="kicker border-b border-encre/40 pb-1 text-[0.62rem] hover:border-or hover:text-or">
                Cette routine est-elle pour toi ? Fais le test →
              </Link>
            )}
            {buyable.length > 0 && (
              <a href="#produits" className="btn-primary">
                <ButtonLabel>{`Voir les ${buyable.length} produits`}</ButtonLabel>
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-16 px-4 py-16 sm:px-8 lg:grid-cols-[1fr_21rem] lg:gap-20">
        {/* SHOPPING LIST — first on mobile, sticky sidebar on desktop */}
        <aside id="produits" aria-labelledby="produits-title" className="scroll-mt-32 lg:order-2">
          <div className="border border-ligne bg-perle p-6 lg:sticky lg:top-32">
            <p className="kicker text-[0.6rem] text-or">La routine en un coup d’œil</p>
            <h2 id="produits-title" className="mt-2 text-xl">
              Les produits de {r.name}
            </h2>
            <ol className="mt-6 grid gap-5">
              {r.steps.map((s) => (
                <li key={s.n} className="grid grid-cols-[3.5rem_1fr] items-center gap-4">
                  {s.image ? (
                    <Image src={s.image.src} width={s.image.w} height={s.image.h} alt="" sizes="56px" className="aspect-square w-14 object-cover" />
                  ) : (
                    <span className="grid aspect-square w-14 place-items-center bg-sable font-light text-or italic">{s.n}</span>
                  )}
                  <div className="grid min-w-0 gap-0.5">
                    <p className="kicker text-[0.55rem] text-taupe">Étape {s.n}</p>
                    <p className="truncate text-sm" title={s.name}>{s.name || s.brand}</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-taupe">{s.brand}</p>
                      <BuyButton step={s} slug={r.slug} variant="link" />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            {brands.length > 0 && (
              <p className="mt-6 border-t border-ligne pt-4 text-xs leading-relaxed text-taupe">
                Achat direct sur les boutiques des marques : {brands.join(', ')}.
              </p>
            )}
          </div>
        </aside>

        {/* STORY + STEPS */}
        <article className="grid gap-20 lg:order-1">
          {(r.problem || r.story.length > 0) && (
            <section className="grid gap-5">
              {r.hairDescription && <p className="kicker text-or">{r.hairDescription}</p>}
              {r.problem && <h2 className="display text-3xl sm:text-4xl">{r.problem}</h2>}
              {r.story.map((p, i) => (
                <p key={i} className="max-w-2xl text-lg leading-relaxed text-encre/85">{p}</p>
              ))}
            </section>
          )}

          {r.highlights.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="En bref">
              {r.highlights.map((h) => (
                <li key={h} className="kicker border border-ligne px-3 py-2 text-[0.58rem] text-taupe">{h}</li>
              ))}
            </ul>
          )}

          <section aria-labelledby="etapes" className="grid gap-16">
            <div className="flex items-center gap-4">
              <h2 id="etapes" className="display text-3xl sm:text-4xl">
                Étape <span className="accent">par étape</span>
              </h2>
              <Wave name="tight" width={90} className="hidden text-or sm:block" />
            </div>
            {r.steps.map((s, i) => (
              <section key={s.n} aria-labelledby={`step-${s.n}`} className={`grid items-center gap-8 md:grid-cols-2 ${i % 2 ? 'md:[&>figure]:order-2' : ''}`}>
                {s.image && (
                  <figure className="overflow-hidden bg-sable">
                    <Image src={s.image.src} width={s.image.w} height={s.image.h} alt={`${s.name || s.brand} — étape ${s.n} de la routine de ${r.name}`} sizes="(min-width: 1024px) 28vw, (min-width: 768px) 45vw, 90vw" className="aspect-[4/5] w-full object-cover" />
                  </figure>
                )}
                <div className="grid content-center gap-4">
                  <p className="font-light text-or italic text-4xl">{String(s.n).padStart(2, '0')}</p>
                  <h3 id={`step-${s.n}`} className="text-2xl leading-snug">{s.name || s.brand}</h3>
                  {s.name && s.brand && <p className="kicker text-[0.6rem] text-taupe">{s.brand}</p>}
                  {s.text.map((t, j) => (
                    <p key={j} className="leading-relaxed text-encre/85">{t}</p>
                  ))}
                  <BuyButton step={s} slug={r.slug} className="mt-2 w-fit" />
                </div>
              </section>
            ))}
          </section>

          <p className="border-t border-ligne pt-6 text-xs leading-relaxed text-taupe">
            Routine partagée par {r.name}, testée dans la vraie vie. Les liens « Acheter » ouvrent les boutiques des marques dans un nouvel onglet.
          </p>
        </article>
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="bg-sable px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
              <h2 className="display text-3xl sm:text-4xl">
                {profile ? 'Aussi faites ' : 'Ces routines '}
                <span className="accent">{profile ? 'pour ton profil' : 'pourraient te convenir'}</span>
              </h2>
              <Link href="/routines" className="kicker border-b border-encre/40 pb-1 text-[0.62rem] hover:border-or hover:text-or">
                Toutes les routines
              </Link>
            </div>
            <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {related.map(({ routine, match: m }) => (
                <li key={routine.slug}>
                  <RoutineCard routine={routine} match={m} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CLOSING CTA */}
      <section className="px-4 py-24 text-center">
        <div className="mx-auto grid max-w-2xl justify-items-center gap-6">
          {profile ? (
            <>
              <p className="kicker text-or">Et si tu participais ?</p>
              <p className="display text-3xl">Ta routine peut <span className="accent">aider quelqu’un</span></p>
              <a href={SHARE_FORM} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                Partager ma routine <span aria-hidden>↗</span>
              </a>
            </>
          ) : (
            <>
              <p className="kicker text-or">Avant d’acheter</p>
              <p className="display text-3xl">Vérifie que cette routine <span className="accent">te ressemble</span></p>
              <p className="max-w-md text-taupe">60 secondes pour connaître ta texture, ta porosité et trouver les routines faites pour toi.</p>
              <Link href="/diagnostic" className="btn-primary">
                <ButtonLabel>Faire mon diagnostic</ButtonLabel>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* MOBILE STICKY PURCHASE BAR */}
      {buyable.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ligne bg-creme/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm">{r.title}</p>
              <p className="kicker text-[0.55rem] text-taupe">
                {buyable.length} produit{buyable.length > 1 ? 's' : ''}
                {match ? ` · ${match.score} % pour toi` : ''}
              </p>
            </div>
            <a href="#produits" className="btn-primary min-h-11 shrink-0 px-5">
              Les produits
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
