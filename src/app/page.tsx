import Image from 'next/image'
import Link from 'next/link'
import { ScanIcon } from '@/components/app/Icons'
import { Wave } from '@/components/brand/Wave'
import { HairBadge } from '@/components/profile/HairBadge'
import { MatchBadge } from '@/components/routines/MatchBadge'
import { loadVideos, VideoGrid } from '@/components/video/VideoRail'
import laurenBannerImg from '@/assets/photos/lauren-banniere.webp'
import tresserImg from '@/assets/photos/tresser.webp'
import { PRODUCTS } from '@/content/catalog'
import { plannedSteps, STEP_INFO, WEEK, weeklyRitual } from '@/content/regimen'
import { CATEGORY_LABEL, CATEGORY_SLUG, rankRoutines, scoreFit, type RoutineCategory } from '@/content/routines'
import { TEXTURES } from '@/lib/hair/options'
import { auth } from '@/server/auth'
import { getVisitorProfile } from '@/server/hair/visitor-profile'

/** Index of today in WEEK (Mon = 0), in Paris time. */
function todayIndex(): number {
  const day = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'Europe/Paris' }).format(new Date())
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(day)
}

const TODAY_COPY = {
  wash: { title: 'C’est ton wash day', text: 'Toutes les étapes de ta routine, dans l’ordre.' },
  refresh: { title: 'Jour de rafraîchissement', text: 'Une brume d’eau et ton soin sans rinçage pour réveiller tes boucles.' },
  rest: { title: 'Jour de repos', text: 'Pas de manipulation : protège tes cheveux la nuit avec du satin.' },
} as const

export default async function Home() {
  const [profile, session] = await Promise.all([getVisitorProfile(), auth()])
  const firstName = session?.user?.name?.split(' ')[0]
  const routines = rankRoutines(profile).slice(0, 10)
  const products = PRODUCTS.map((p) => ({ p, m: profile ? scoreFit({ textures: p.textures, goals: p.goals, porosity: null }, profile) : null }))
    .sort((a, b) => (b.m?.score ?? 0) - (a.m?.score ?? 0) || b.p.usages.length - a.p.usages.length)
    .slice(0, 10)
  const videos = await loadVideos({ textures: profile ? [profile.texture] : undefined, limit: 4 })
  const today = profile ? weeklyRitual(profile).plan[todayIndex()] : null
  const steps = profile ? plannedSteps(profile) : []

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-5 pb-14 sm:px-8 md:pt-10">
      {/* GREETING */}
      <header className="grid gap-1">
        <p className="kicker text-[0.6rem] text-taupe">
          {new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }).format(new Date())}
        </p>
        <h1 className="display text-3xl sm:text-5xl">
          {firstName ? `Bonjour ${firstName}` : 'Bonjour'}
          <span className="accent">{profile ? ', prête pour ta routine ?' : ', parlons cheveux'}</span>
        </h1>
      </header>

      {/* PRIMARY CARD */}
      {profile && today ? (
        <section aria-labelledby="today" className="grid gap-5 overflow-hidden rounded-[2rem] bg-encre p-6 text-creme sm:grid-cols-[1fr_auto] sm:items-end sm:p-8">
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="kicker text-[0.6rem] text-or-clair">Aujourd’hui · {WEEK[todayIndex()]}</p>
              <HairBadge texture={profile.texture} porosity={profile.porosity} goals={profile.goals} size="sm" />
            </div>
            <h2 id="today" className="display text-3xl sm:text-4xl">{TODAY_COPY[today.kind].title}</h2>
            <p className="max-w-md text-creme/80">{TODAY_COPY[today.kind].text}</p>
            {today.kind === 'wash' && (
              <ol className="flex flex-wrap gap-2">
                {steps.map((s, i) => (
                  <li key={s.type} className="rounded-full border border-creme/25 px-3 py-1 text-xs">
                    {i + 1}. {STEP_INFO[s.type].title}
                  </li>
                ))}
              </ol>
            )}
            <ol className="mt-2 grid grid-cols-7 gap-1" aria-label="Ma semaine">
              {weeklyRitual(profile).plan.map((d, i) => (
                <li key={d.day} className={`grid justify-items-center gap-1 rounded-xl py-2 text-[0.6rem] ${i === todayIndex() ? 'bg-or text-creme' : d.kind === 'wash' ? 'bg-creme/15' : d.kind === 'refresh' ? 'bg-creme/8' : ''}`}>
                  <span>{d.day}</span>
                  <span aria-hidden className={`size-1.5 rounded-full ${d.kind === 'wash' ? 'bg-or-clair' : d.kind === 'refresh' ? 'bg-creme/60' : 'bg-transparent'}`} />
                </li>
              ))}
            </ol>
          </div>
          <div className="grid gap-2">
            <Link href="/ma-routine" className="btn bg-creme text-encre hover:bg-champagne">Ouvrir ma routine</Link>
            <Link href={session?.user ? '/ma-routine/suivi' : ('/connexion?callbackUrl=%2Fma-routine%2Fsuivi' as '/connexion')} className="btn border border-creme/30 text-creme hover:bg-creme/10">
              Ajouter une photo
            </Link>
          </div>
        </section>
      ) : (
        <section aria-labelledby="scan" className="relative isolate overflow-hidden rounded-[2rem] bg-encre text-creme">
          <Image src={tresserImg} alt="" priority placeholder="blur" sizes="(min-width: 768px) 60rem, 100vw" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-55" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-encre via-encre/40 to-transparent" />
          <div className="grid min-h-[26rem] content-end gap-4 p-6 sm:min-h-[30rem] sm:p-10">
            <p className="kicker text-[0.6rem] text-or-clair">Nouveau · scan capillaire</p>
            <h2 id="scan" className="display text-4xl sm:text-6xl">
              Une photo.
              <br />
              <span className="accent">Ta routine.</span>
            </h2>
            <p className="max-w-md text-creme/85">L’IA lit ta texture sur une photo, tu réponds à 4 questions, et ta routine sur-mesure est prête.</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/scan" className="btn gap-3 bg-creme text-encre hover:bg-champagne">
                <ScanIcon className="size-5" /> Scanner mes cheveux
              </Link>
              <Link href="/diagnostic" className="kicker border-b border-creme/50 pb-1 text-[0.6rem] text-creme hover:border-or-clair">
                ou 6 questions
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* STORIES — community routines */}
      <section aria-labelledby="stories" className="grid gap-4">
        <div className="flex items-end justify-between">
          <h2 id="stories" className="text-xl">{profile ? 'Routines proches de toi' : 'Routines de la communauté'}</h2>
          <Link href="/routines" className="kicker text-[0.58rem] text-or">Tout voir</Link>
        </div>
        <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
          {routines.map(({ routine: r, match }) => {
            const img = r.heroMobile ?? r.hero
            return (
              <li key={r.slug} className="snap-start">
                <Link href={`/routines/${r.slug}` as '/routines'} className="grid w-20 justify-items-center gap-2 text-center">
                  <span className={`rounded-full p-[3px] ${match && match.score >= 75 ? 'bg-gradient-to-tr from-or via-or-clair to-or' : 'bg-ligne'}`}>
                    {img && <Image src={img.src} width={img.w} height={img.h} alt="" sizes="72px" className="size-[4.5rem] rounded-full border-2 border-creme object-cover" />}
                  </span>
                  <span className="w-full truncate text-xs">{r.name}</span>
                  {match && <span className="kicker -mt-1 text-[0.5rem] text-or">{match.score} %</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      {/* TEXTURE SHORTCUTS */}
      <nav aria-label="Explorer par texture" className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {(Object.keys(CATEGORY_LABEL) as RoutineCategory[]).map((c) => (
          <Link key={c} href={`/routines?texture=${CATEGORY_SLUG[c]}` as '/routines'} className="whitespace-nowrap rounded-full border border-ligne bg-perle px-4 py-2.5 text-sm hover:border-or">
            {CATEGORY_LABEL[c]}
          </Link>
        ))}
      </nav>

      {/* PRODUCTS CAROUSEL */}
      <section aria-labelledby="pour-toi" className="grid gap-4">
        <div className="flex items-end justify-between">
          <h2 id="pour-toi" className="text-xl">{profile ? `Pour tes cheveux ${TEXTURES[profile.texture].code}` : 'Les plus utilisés'}</h2>
          <Link href="/produits" className="kicker text-[0.58rem] text-or">Tout voir</Link>
        </div>
        <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
          {products.map(({ p, m }) => (
            <li key={p.slug} className="w-40 shrink-0 snap-start sm:w-48">
              <Link href={`/produits/${p.slug}` as '/produits'} className="grid gap-2">
                <div className="relative overflow-hidden rounded-2xl bg-perle">
                  {p.image && <Image src={p.image.src} width={p.image.w} height={p.image.h} alt={p.name} sizes="12rem" className="aspect-square w-full object-cover" />}
                  {m && <div className="absolute top-2 left-2"><MatchBadge match={m} size="sm" /></div>}
                </div>
                <p className="kicker truncate text-[0.52rem] text-or">{p.brand ?? p.offer?.merchantName ?? 'Communauté'}</p>
                <p className="line-clamp-2 text-sm leading-snug">{p.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* VIDEOS */}
      {videos.length > 0 && (
        <section aria-labelledby="videos" className="grid gap-4">
          <h2 id="videos" className="text-xl">{profile ? `En vidéo, sur cheveux ${TEXTURES[profile.texture].code}` : 'En vidéo'}</h2>
          <VideoGrid videos={videos} />
        </section>
      )}

      {/* COMMUNITY / PROGRESS */}
      <section className="grid gap-4 md:grid-cols-2">
        <Link href={session?.user ? '/ma-routine/suivi' : ('/connexion?callbackUrl=%2Fma-routine%2Fsuivi' as '/connexion')} className="group relative isolate grid min-h-48 content-end overflow-hidden rounded-[2rem] p-6 text-encre">
          <Image src={laurenBannerImg} alt="" placeholder="blur" sizes="(min-width: 768px) 30rem, 100vw" className="absolute inset-0 -z-10 h-full w-full object-cover object-[25%_center] transition-transform duration-[1.4s] group-hover:scale-105" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-perle/40 to-perle/95" />
          <div className="grid justify-items-end gap-1 text-right">
            <p className="kicker text-[0.58rem] text-or">Mon suivi</p>
            <p className="text-2xl">Avant / après</p>
            <p className="max-w-[14rem] text-sm text-taupe">Une photo par wash day pour voir ta routine faire effet.</p>
          </div>
        </Link>
        <Link href="/jumelles" className="grid min-h-48 content-between rounded-[2rem] border border-ligne bg-perle p-6 hover:border-or">
          <Wave name="curl" width={150} className="text-or" />
          <div className="grid gap-1">
            <p className="kicker text-[0.58rem] text-or">Communauté</p>
            <p className="text-2xl">Tes jumelles capillaires</p>
            <p className="text-sm text-taupe">Même texture, même porosité : suis leurs routines et leurs salles de bain.</p>
          </div>
        </Link>
      </section>
    </div>
  )
}
