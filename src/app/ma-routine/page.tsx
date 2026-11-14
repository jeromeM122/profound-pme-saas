import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Wave } from '@/components/brand/Wave'
import { JourneySteps } from '@/components/journey/JourneySteps'
import { HairBadge } from '@/components/profile/HairBadge'
import { BuyButton } from '@/components/routines/BuyButton'
import { MatchBadge } from '@/components/routines/MatchBadge'
import { RoutineCard } from '@/components/routines/RoutineCard'
import { ButtonLabel } from '@/components/ui/ButtonLabel'
import type { CatalogProduct } from '@/content/catalog'
import { buildRegimen, shoppingList, STEP_INFO, weeklyRitual, type StepType } from '@/content/regimen'
import { rankRoutines } from '@/content/routines'
import { TEXTURES } from '@/lib/hair/options'
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { getVisitorProfile } from '@/server/hair/visitor-profile'
import { chooseProduct, toggleOwned } from './actions'
import { loadVideos, VideoGrid } from '@/components/video/VideoRail'

export const metadata: Metadata = { title: 'Ma routine sur-mesure', robots: { index: false } }

const FROM = '/ma-routine'

function usageLabel(p: CatalogProduct) {
  return `Dans ${p.usages.length} routine${p.usages.length > 1 ? 's' : ''} de la communauté`
}

export default async function MaRoutinePage() {
  const [profile, session] = await Promise.all([getVisitorProfile(), auth()])
  const userId = session?.user?.id ?? null

  if (!profile) return <Welcome />

  const [choicesRows, ownedRows] = userId
    ? await Promise.all([
        db.routineChoice.findMany({ where: { userId }, select: { step: true, product: { select: { slug: true } } } }),
        db.bathroomItem.findMany({ where: { userId, status: 'USING' }, select: { product: { select: { slug: true } } } }),
      ])
    : [[], []]
  const choices = Object.fromEntries(choicesRows.map((c) => [c.step, c.product.slug])) as Partial<Record<StepType, string>>
  const owned = new Set(ownedRows.map((o) => o.product.slug))

  const regimen = buildRegimen(profile, choices)
  const toBuy = shoppingList(regimen, owned)
  const missing = toBuy.reduce((n, g) => n + g.items.length, 0)
  const ownedCount = regimen.filter((s) => s.pick && owned.has(s.pick.product.slug)).length
  const { plan, summary } = weeklyRitual(profile)
  const inspiration = rankRoutines(profile).slice(0, 4)
  const texture = TEXTURES[profile.texture]
  const pickedIds = (await db.product.findMany({ where: { slug: { in: regimen.flatMap((s) => (s.pick ? [s.pick.product.slug] : [])) } }, select: { id: true } })).map((p) => p.id)
  const sameTexture = pickedIds.length ? await loadVideos({ productIds: pickedIds, textures: [profile.texture], viewerId: userId, limit: 8 }) : []
  const videos = sameTexture.length ? sameTexture : pickedIds.length ? await loadVideos({ productIds: pickedIds, viewerId: userId, limit: 8 }) : []

  return (
    <div className="pb-28 lg:pb-0">
      <JourneySteps current={1} done={1} />

      {/* HEADER */}
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pt-14 pb-10 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid gap-4">
          <p className="kicker text-or">Ma routine sur-mesure</p>
          <h1 className="display text-4xl sm:text-6xl">
            Ta routine <span className="accent">{texture.code}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <HairBadge texture={profile.texture} porosity={profile.porosity} goals={profile.goals} size="sm" />
            <Link href="/diagnostic" className="kicker text-[0.58rem] text-taupe underline underline-offset-4 hover:text-or">
              Refaire mon diagnostic
            </Link>
          </div>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-taupe">
          Construite à partir de ton diagnostic et des produits qui ont fait leurs preuves dans les routines de la communauté.
        </p>
      </section>

      {/* SUMMARY STRIP */}
      <section className="border-y border-ligne bg-perle">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-10 gap-y-4 px-4 py-5 sm:px-8">
          <dl className="flex flex-wrap gap-x-10 gap-y-3">
            <Stat label="Étapes" value={regimen.length} />
            <Stat label="Déjà chez moi" value={userId ? ownedCount : '—'} />
            <Stat label="À me procurer" value={missing} />
          </dl>
          <div className="ml-auto flex flex-wrap gap-3">
            {missing > 0 && (
              <a href="#a-acheter" className="btn-primary">
                <ButtonLabel>{`Compléter ma routine (${missing})`}</ButtonLabel>
              </a>
            )}
            {!userId && (
              <Link href="/connexion?callbackUrl=%2Fma-routine" className="btn-ghost">
                Sauvegarder ma routine
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section aria-labelledby="etapes" className="mx-auto max-w-5xl px-4 py-16 sm:px-8">
        <div className="mb-10 flex items-center gap-4">
          <h2 id="etapes" className="display text-3xl sm:text-4xl">
            Étape <span className="accent">par étape</span>
          </h2>
          <Wave name="tight" width={90} className="hidden text-or sm:block" />
        </div>
        <ol className="grid gap-6">
          {regimen.map((s, i) => {
            const p = s.pick?.product
            const isOwned = p ? owned.has(p.slug) : false
            return (
              <li key={s.type} className="grid gap-6 border border-ligne bg-perle p-5 sm:grid-cols-[auto_8rem_1fr] sm:p-7">
                <span className="font-light text-or italic text-3xl">{String(i + 1).padStart(2, '0')}</span>
                <div className="hidden sm:block">
                  {p?.image && <Image src={p.image.src} width={p.image.w} height={p.image.h} alt="" sizes="128px" className="aspect-square w-32 object-cover" />}
                </div>
                <div className="grid gap-3">
                  <div>
                    <p className="kicker text-[0.6rem] text-or">{STEP_INFO[s.type].short}</p>
                    <h3 className="text-2xl">{STEP_INFO[s.type].title}</h3>
                  </div>
                  <p className="leading-relaxed text-encre/80">{s.why}</p>

                  {p ? (
                    <div className="grid gap-3 border-t border-ligne pt-4">
                      <div className="flex items-start gap-4">
                        {p.image && <Image src={p.image.src} width={p.image.w} height={p.image.h} alt="" sizes="64px" className="aspect-square w-16 object-cover sm:hidden" />}
                        <div className="grid gap-1">
                          <Link href={`/produits/${p.slug}` as '/produits'} className="text-lg leading-snug hover:text-or">
                            {p.name}
                          </Link>
                          <p className="text-xs text-taupe">
                            {[p.usages[0]?.stepName, p.offer?.merchantName].filter(Boolean).join(' · ')} · {usageLabel(p)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        {s.pick && <MatchBadge match={s.pick.match} size="sm" />}
                        {isOwned && <span className="kicker bg-champagne px-2 py-1 text-[0.55rem]">✓ Dans ma salle de bain</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        {!isOwned && <BuyButton offer={p.offer} from={FROM} />}
                        {userId ? (
                          <form action={toggleOwned}>
                            <input type="hidden" name="slug" value={p.slug} />
                            <button className="kicker border border-ligne px-4 py-3 text-[0.58rem] hover:border-or hover:text-or" aria-pressed={isOwned}>
                              {isOwned ? 'Retirer de ma salle de bain' : 'Je l’ai déjà'}
                            </button>
                          </form>
                        ) : (
                          <Link href="/connexion?callbackUrl=%2Fma-routine" className="kicker text-[0.58rem] text-taupe underline underline-offset-4 hover:text-or">
                            Je l’ai déjà
                          </Link>
                        )}
                      </div>

                      {s.alternatives.length > 0 && (
                        <details className="group mt-1">
                          <summary className="kicker w-fit cursor-pointer list-none text-[0.58rem] text-taupe hover:text-or">
                            <span className="group-open:hidden">Voir {s.alternatives.length} alternatives ↓</span>
                            <span className="hidden group-open:inline">Masquer les alternatives ↑</span>
                          </summary>
                          <ul className="mt-4 grid gap-3">
                            {s.alternatives.map((a) => (
                              <li key={a.product.slug} className="flex flex-wrap items-center gap-4 bg-creme p-3">
                                {a.product.image && <Image src={a.product.image.src} width={a.product.image.w} height={a.product.image.h} alt="" sizes="48px" className="aspect-square w-12 object-cover" />}
                                <div className="grid min-w-0 flex-1 gap-0.5">
                                  <Link href={`/produits/${a.product.slug}` as '/produits'} className="truncate text-sm hover:text-or">
                                    {a.product.name}
                                  </Link>
                                  <p className="text-xs text-taupe">
                                    {a.product.offer?.merchantName ?? 'Boutique à venir'} · {a.match.score} % pour toi
                                  </p>
                                </div>
                                {userId ? (
                                  <form action={chooseProduct}>
                                    <input type="hidden" name="step" value={s.type} />
                                    <input type="hidden" name="slug" value={a.product.slug} />
                                    <button className="kicker border border-encre/60 px-3 py-2 text-[0.55rem] hover:bg-encre hover:text-creme">Choisir</button>
                                  </form>
                                ) : (
                                  <Link href={`/produits/${a.product.slug}` as '/produits'} className="kicker text-[0.55rem] text-or">
                                    Voir →
                                  </Link>
                                )}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-taupe">Aucun produit de la communauté pour cette étape pour l’instant.</p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      {/* WEEKLY RITUAL */}
      <section id="rituel" aria-labelledby="rituel-title" className="scroll-mt-28 bg-sable px-4 py-20 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-8">
          <div className="grid gap-3">
            <p className="kicker text-or">Mon rituel</p>
            <h2 id="rituel-title" className="display text-3xl sm:text-4xl">
              Ta semaine <span className="accent">type</span>
            </h2>
            <p className="max-w-2xl text-taupe">{summary}</p>
          </div>
          <ol className="grid grid-cols-7 gap-px bg-ligne">
            {plan.map((d) => (
              <li key={d.day} className={`grid min-h-28 content-between gap-2 p-3 ${d.kind === 'wash' ? 'bg-encre text-creme' : d.kind === 'refresh' ? 'bg-champagne' : 'bg-perle'}`}>
                <span className="kicker text-[0.58rem]">{d.day}</span>
                <span className={`text-[0.7rem] leading-tight sm:text-sm ${d.kind === 'rest' ? 'text-taupe' : ''}`}>{d.label}</span>
              </li>
            ))}
          </ol>
          <div className="grid gap-4 text-sm sm:grid-cols-3">
            <p><span className="kicker mr-2 inline-block size-2.5 bg-encre align-middle" aria-hidden /> <strong className="font-normal">Wash day</strong> : toutes les étapes, dans l’ordre.</p>
            <p><span className="kicker mr-2 inline-block size-2.5 bg-champagne align-middle" aria-hidden /> <strong className="font-normal">Rafraîchir</strong> : brume d’eau + {STEP_INFO.LEAVE_IN.title.toLowerCase()}.</p>
            <p><span className="kicker mr-2 inline-block size-2.5 border border-ligne bg-perle align-middle" aria-hidden /> <strong className="font-normal">Les autres jours</strong> : foulard ou bonnet en satin la nuit.</p>
          </div>
        </div>
      </section>

      {/* SHOPPING LIST */}
      <section id="a-acheter" aria-labelledby="achats-title" className="scroll-mt-28 mx-auto max-w-5xl px-4 py-20 sm:px-8">
        <div className="mb-8 grid gap-3">
          <p className="kicker text-or">Mes produits</p>
          <h2 id="achats-title" className="display text-3xl sm:text-4xl">
            {missing > 0 ? (
              <>
                Il te manque <span className="accent">{missing} produit{missing > 1 ? 's' : ''}</span>
              </>
            ) : (
              <>
                Ta routine est <span className="accent">complète</span>
              </>
            )}
          </h2>
          {missing > 0 && (
            <p className="text-taupe">
              Regroupés par boutique : {toBuy.length} commande{toBuy.length > 1 ? 's' : ''} suffi{toBuy.length > 1 ? 'sent' : 't'}. Paiement et livraison sur le site de chaque boutique.
            </p>
          )}
        </div>
        {missing > 0 && (
          <ul className="grid gap-4">
            {toBuy.map((g) => (
              <li key={g.merchant} className="border border-ligne bg-perle">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ligne px-5 py-3">
                  <p className="text-lg">{g.merchant}</p>
                  <p className="kicker text-[0.55rem] text-taupe">
                    {g.isBrandShop ? 'Boutique officielle' : 'Revendeur'} · {g.items.length} produit{g.items.length > 1 ? 's' : ''}
                  </p>
                </div>
                <ul>
                  {g.items.map(({ step, product }) => (
                    <li key={product.slug} className="flex flex-wrap items-center gap-4 border-b border-ligne px-5 py-4 last:border-0">
                      {product.image && <Image src={product.image.src} width={product.image.w} height={product.image.h} alt="" sizes="56px" className="aspect-square w-14 object-cover" />}
                      <div className="grid min-w-0 flex-1 gap-0.5">
                        <p className="kicker text-[0.55rem] text-or">{STEP_INFO[step].title}</p>
                        <p className="truncate">{product.name}</p>
                      </div>
                      <BuyButton offer={product.offer} from={FROM} variant="ghost" compact />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
        {!userId && (
          <div className="mt-8 grid gap-3 border border-or-clair bg-champagne/40 p-6 sm:flex sm:items-center sm:justify-between">
            <p>Crée ton compte pour cocher les produits que tu as déjà et choisir tes alternatives.</p>
            <Link href="/connexion?callbackUrl=%2Fma-routine" className="btn-primary shrink-0">
              <ButtonLabel>Sauvegarder ma routine</ButtonLabel>
            </Link>
          </div>
        )}
      </section>

      {/* PROGRESS */}
      <section className="border-y border-ligne px-4 py-16 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div className="grid gap-2">
            <p className="kicker text-or">Mon suivi</p>
            <p className="display text-3xl">Vois ta routine <span className="accent">faire effet</span></p>
            <p className="text-taupe">Une photo à chaque wash day, une comparaison avant / après. Tes photos restent privées.</p>
          </div>
          <Link href={userId ? '/ma-routine/suivi' : ('/connexion?callbackUrl=%2Fma-routine%2Fsuivi' as '/connexion')} className="btn-primary">
            <ButtonLabel>{userId ? 'Ouvrir mon suivi' : 'Commencer mon suivi'}</ButtonLabel>
          </Link>
        </div>
      </section>

      {videos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
          <h2 className="display mb-8 text-3xl sm:text-4xl">
            Tes produits <span className="accent">en vidéo</span>
            {sameTexture.length > 0 && <span className="kicker ml-3 align-middle text-[0.6rem] text-taupe">sur cheveux {texture.code}</span>}
          </h2>
          <VideoGrid videos={videos} />
        </section>
      )}

      {/* INSPIRATION */}
      <section className="bg-perle px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="display mb-10 text-3xl sm:text-4xl">
            Elles ont un profil <span className="accent">proche du tien</span>
          </h2>
          <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {inspiration.map(({ routine, match }) => (
              <li key={routine.slug}>
                <RoutineCard routine={routine} match={match} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MOBILE STICKY BAR */}
      <div className="fixed inset-x-0 bottom-[var(--tabbar-h)] z-30 border-t border-ligne bg-creme/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm">Ma routine {texture.code}</p>
            <p className="kicker text-[0.55rem] text-taupe">
              {regimen.length} étapes · {missing > 0 ? `${missing} à me procurer` : 'complète'}
            </p>
          </div>
          {missing > 0 ? (
            <a href="#a-acheter" className="btn-primary min-h-11 shrink-0 px-5">
              Compléter
            </a>
          ) : (
            <a href="#rituel" className="btn-ghost min-h-11 shrink-0 px-5">
              Mon rituel
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <dt className="kicker text-[0.58rem] text-taupe">{label}</dt>
      <dd className="text-2xl font-light">{value}</dd>
    </div>
  )
}

function Welcome() {
  const steps = [
    { n: '01', t: 'Mon diagnostic', d: 'Six questions sur ta texture, ta porosité, ton cuir chevelu et tes objectifs.' },
    { n: '02', t: 'Ma routine', d: 'Les étapes dont tes cheveux ont besoin, avec le produit le plus adapté pour chacune.' },
    { n: '03', t: 'Mes produits', d: 'Ce que tu as déjà, ce qui te manque, et où l’acheter — regroupé par boutique.' },
    { n: '04', t: 'Mon rituel', d: 'Ta semaine type : wash day, rafraîchissement et protection de nuit.' },
  ]
  return (
    <div className="pb-24">
      <JourneySteps current={0} done={0} />
      <section className="mx-auto grid max-w-5xl justify-items-center gap-6 px-4 pt-16 pb-12 text-center">
        <p className="kicker text-or">Ma routine sur-mesure</p>
        <h1 className="display text-4xl sm:text-6xl">
          Ta routine <span className="accent">en quatre temps</span>
        </h1>
        <p className="max-w-xl text-taupe">Commence par ton diagnostic : en soixante secondes, on construit la routine faite pour tes cheveux.</p>
        <Link href="/diagnostic" className="btn-primary">
          <ButtonLabel>Commencer mon diagnostic</ButtonLabel>
        </Link>
      </section>
      <ol className="mx-auto grid max-w-6xl border-y border-ligne px-4 sm:px-8 md:grid-cols-4 md:divide-x md:divide-ligne">
        {steps.map((s) => (
          <li key={s.n} className="grid gap-3 px-4 py-10 text-center">
            <span className="font-light text-or italic text-3xl">{s.n}</span>
            <h2 className="kicker text-sm text-encre">{s.t}</h2>
            <p className="text-sm leading-relaxed text-taupe">{s.d}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
