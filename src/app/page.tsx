import Image from 'next/image'
import Link from 'next/link'
import { loadVideos, VideoGrid } from '@/components/video/VideoRail'
import cindyImg from '@/assets/photos/cindy.webp'
import gabouImg from '@/assets/photos/gabou.webp'
import joannaImg from '@/assets/photos/joanna.webp'
import laurenBannerImg from '@/assets/photos/lauren-banniere.webp'
import tresserImg from '@/assets/photos/tresser.webp'
import { PRODUCTS } from '@/content/catalog'
import { plannedSteps, STEP_INFO, WEEK, weeklyRitual } from '@/content/regimen'
import { CATEGORY_LABEL, CATEGORY_SLUG, rankRoutines, scoreFit, type RoutineCategory } from '@/content/routines'
import { POROSITY, TEXTURES } from '@/lib/hair/options'
import { auth } from '@/server/auth'
import { getVisitorProfile } from '@/server/hair/visitor-profile'

/** Index of today in WEEK (Mon = 0), in Paris time. */
function todayIndex(): number {
  const day = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'Europe/Paris' }).format(new Date())
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(day)
}

const TODAY_COPY = {
  wash: { title: 'Wash day', text: 'Toutes les étapes de ta routine, dans l’ordre.' },
  refresh: { title: 'Rafraîchissement', text: 'Une brume d’eau et ton soin sans rinçage pour réveiller tes boucles.' },
  rest: { title: 'Repos', text: 'Pas de manipulation : protège tes cheveux la nuit avec du satin.' },
} as const

const caption = 'text-[0.64rem] uppercase tracking-[0.16em]'

export default async function Home() {
  const [profile, session] = await Promise.all([getVisitorProfile(), auth()])
  const routines = rankRoutines(profile).slice(0, 10)
  const products = PRODUCTS.map((p) => ({ p, m: profile ? scoreFit({ textures: p.textures, goals: p.goals, porosity: null }, profile) : null }))
    .sort((a, b) => (b.m?.score ?? 0) - (a.m?.score ?? 0) || b.p.usages.length - a.p.usages.length)
    .slice(0, 8)
  const videos = await loadVideos({ textures: profile ? [profile.texture] : undefined, limit: 4 })
  const ritual = profile ? weeklyRitual(profile) : null
  const today = ritual ? ritual.plan[todayIndex()] : null
  const steps = profile ? plannedSteps(profile) : []
  const suiviHref = session?.user ? '/ma-routine/suivi' : ('/connexion?callbackUrl=%2Fma-routine%2Fsuivi' as '/connexion')

  return (
    <div className="grid">
      {/* ── HERO: full-bleed diptych, text set in white over the photograph ── */}
      <section aria-labelledby="hero" className="relative isolate grid h-[calc(100svh-3.5rem-var(--tabbar-h))] min-h-[32rem] grid-rows-[100%] overflow-hidden md:h-[calc(100svh-5rem)] md:grid-cols-2">
        <Image src={tresserImg} alt="" priority placeholder="blur" sizes="(min-width: 768px) 50vw, 100vw" className="h-full min-h-0 w-full object-cover" />
        <Image src={gabouImg} alt="" priority placeholder="blur" sizes="50vw" className="hidden h-full min-h-0 w-full object-cover md:block" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 grid justify-items-center gap-4 px-6 pb-10 text-center text-white md:pb-14">
          <p className={caption}>{profile ? `Ton profil · ${TEXTURES[profile.texture].code} · ${POROSITY[profile.porosity].label}` : 'Scan capillaire'}</p>
          <h1 id="hero" className="display text-4xl sm:text-6xl">{profile ? 'Ta routine t’attend' : 'Une photo, ta routine'}</h1>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {profile ? (
              <>
                <Link href="/ma-routine" className="link-cta">Ouvrir ma routine</Link>
                <Link href="/scan" className="link-cta">Refaire le scan</Link>
              </>
            ) : (
              <>
                <Link href="/scan" className="link-cta">Scanner mes cheveux</Link>
                <Link href="/diagnostic" className="link-cta">Répondre à 6 questions</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── TODAY (personalised) or the house statement ── */}
      {profile && today && ritual ? (
        <section aria-labelledby="today" className="grid justify-items-center gap-6 px-6 py-20 text-center sm:py-28">
          <p className={`${caption} text-taupe`}>Aujourd’hui · {WEEK[todayIndex()]}</p>
          <h2 id="today" className="display text-3xl sm:text-5xl">{TODAY_COPY[today.kind].title}</h2>
          <p className="max-w-md text-taupe">{TODAY_COPY[today.kind].text}</p>
          {today.kind === 'wash' && (
            <ol className="flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {steps.map((s, i) => (
                <li key={s.type}><span className="text-taupe">{String(i + 1).padStart(2, '0')}</span> {STEP_INFO[s.type].title}</li>
              ))}
            </ol>
          )}
          <ol className="mt-2 grid w-full max-w-md grid-cols-7 border-y border-ligne" aria-label="Ma semaine">
            {ritual.plan.map((d, i) => (
              <li key={d.day} className={`grid justify-items-center gap-2 py-3 ${caption} ${i === todayIndex() ? 'bg-encre text-white' : d.kind === 'rest' ? 'text-taupe' : ''}`}>
                <span>{d.day.slice(0, 1)}</span>
                <span aria-hidden className={`h-px w-3 ${d.kind === 'wash' ? 'bg-current' : d.kind === 'refresh' ? 'bg-current opacity-40' : 'bg-transparent'}`} />
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            <Link href="/ma-routine" className="link-cta">Voir les étapes</Link>
            <Link href={suiviHref} className="link-cta">Ajouter une photo</Link>
          </div>
        </section>
      ) : (
        <section className="grid justify-items-center gap-6 px-6 py-20 text-center sm:py-28">
          <p className={`${caption} text-taupe`}>La maison</p>
          <p className="display max-w-3xl text-2xl sm:text-4xl">
            Chaque texture a sa routine. Nous la lisons sur une photo, puis nous la construisons avec toi, étape par étape.
          </p>
        </section>
      )}

      {/* ── ROUTINES: tall portraits, numbered ── */}
      <section aria-labelledby="routines" className="grid gap-8 pb-20 sm:pb-28">
        <div className="flex items-baseline justify-between px-4 sm:px-10">
          <h2 id="routines" className="display text-2xl sm:text-3xl">{profile ? 'Routines proches de toi' : 'Les routines'}</h2>
          <Link href="/routines" className="link-cta">Tout voir</Link>
        </div>
        <ul className="flex snap-x gap-px overflow-x-auto [scrollbar-width:none]">
          {routines.map(({ routine: r, match }, i) => {
            const img = r.heroMobile ?? r.hero
            return (
              <li key={r.slug} className="w-[72vw] shrink-0 snap-start sm:w-[22rem]">
                <Link href={`/routines/${r.slug}` as '/routines'} className="group grid gap-4">
                  <div className="overflow-hidden bg-perle">
                    {img && <Image src={img.src} width={img.w} height={img.h} alt="" sizes="(min-width: 640px) 22rem, 72vw" className="aspect-[3/4] w-full object-cover transition-transform duration-[1.6s] ease-brand group-hover:scale-[1.03]" />}
                  </div>
                  <div className="grid gap-1 px-4">
                    <p className={`${caption} text-taupe`}>
                      {String(i + 1).padStart(2, '0')} · {CATEGORY_LABEL[r.categories[0] ?? 'MULTI']}{match ? ` · ${match.score} %` : ''}
                    </p>
                    <p className="text-lg font-light">La routine de {r.name}</p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      {/* ── DIPTYCH: the two entry points ── */}
      <section className="grid gap-px md:grid-cols-2">
        {[
          { href: '/scan' as const, img: cindyImg, kicker: 'Le scan', title: 'Lire ta texture', cta: 'Commencer' },
          { href: '/ma-routine' as const, img: joannaImg, kicker: 'Ma routine', title: 'Tes produits, ton rituel', cta: 'Découvrir' },
        ].map((b) => (
          <Link key={b.href} href={b.href} className="group grid gap-6 pb-14 text-center">
            <div className="overflow-hidden">
              <Image src={b.img} alt="" placeholder="blur" sizes="(min-width: 768px) 50vw, 100vw" className="aspect-[4/5] w-full object-cover transition-transform duration-[1.6s] ease-brand group-hover:scale-[1.03]" />
            </div>
            <p className={`${caption} text-taupe`}>{b.kicker}</p>
            <p className="display -mt-3 text-3xl">{b.title}</p>
            <span className="link-cta justify-self-center">{b.cta}</span>
          </Link>
        ))}
      </section>

      {/* ── PRODUCTS: grid on stone tiles ── */}
      <section aria-labelledby="pour-toi" className="grid gap-8 py-20 sm:py-28">
        <div className="grid justify-items-center gap-3 px-6 text-center">
          <p className={`${caption} text-taupe`}>Sélection</p>
          <h2 id="pour-toi" className="display text-3xl sm:text-4xl">{profile ? `Pour tes cheveux ${TEXTURES[profile.texture].code}` : 'Les plus utilisés'}</h2>
        </div>
        <ul className="grid grid-cols-2 gap-px lg:grid-cols-4">
          {products.map(({ p, m }) => (
            <li key={p.slug}>
              <Link href={`/produits/${p.slug}` as '/produits'} className="group grid gap-4 pb-8 text-center">
                <div className="grid aspect-square place-items-center bg-perle p-8 sm:p-12">
                  {p.image && <Image src={p.image.src} width={p.image.w} height={p.image.h} alt={p.name} sizes="(min-width: 1024px) 25vw, 50vw" className="max-h-full w-auto object-contain mix-blend-multiply transition-transform duration-[1.2s] ease-brand group-hover:scale-105" />}
                </div>
                <div className="grid gap-1 px-3">
                  <p className={`${caption} text-taupe`}>{p.brand ?? p.offer?.merchantName ?? 'Communauté'}{m ? ` · ${m.score} %` : ''}</p>
                  <p className="line-clamp-2 text-sm">{p.name}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/produits" className="link-cta justify-self-center">Tous les produits</Link>
      </section>

      {/* ── TEXTURES: an index, not chips ── */}
      <nav aria-label="Explorer par texture" className="mx-4 grid border-t border-ligne sm:mx-10 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(CATEGORY_LABEL) as RoutineCategory[]).map((c) => (
          <Link key={c} href={`/routines?texture=${CATEGORY_SLUG[c]}` as '/routines'} className="group flex items-center justify-between border-b border-ligne py-5 sm:pr-8">
            <span className="text-xl font-light">{CATEGORY_LABEL[c]}</span>
            <span aria-hidden className="text-taupe transition-transform duration-500 group-hover:translate-x-1">→</span>
          </Link>
        ))}
      </nav>

      {/* ── VIDEOS ── */}
      {videos.length > 0 && (
        <section aria-labelledby="videos" className="grid gap-8 px-4 pt-20 sm:px-10 sm:pt-28">
          <h2 id="videos" className="display text-center text-3xl sm:text-4xl">{profile ? `En vidéo, sur cheveux ${TEXTURES[profile.texture].code}` : 'En vidéo'}</h2>
          <VideoGrid videos={videos} />
        </section>
      )}

      {/* ── PROGRESS + COMMUNITY ── */}
      <section className="grid gap-6 pt-20 sm:pt-28">
        <Link href={suiviHref} className="group grid gap-6 text-center">
          <div className="overflow-hidden">
            <Image src={laurenBannerImg} alt="" placeholder="blur" sizes="100vw" className="aspect-[4/3] w-full object-cover object-[25%_center] transition-transform duration-[1.6s] ease-brand group-hover:scale-[1.02] sm:aspect-[8/3]" />
          </div>
          <p className={`${caption} text-taupe`}>Mon suivi</p>
          <p className="display -mt-3 text-3xl sm:text-4xl">Avant, après</p>
          <p className="mx-auto max-w-sm px-6 text-sm text-taupe">Une photo par wash day pour voir ta routine faire effet.</p>
          <span className="link-cta justify-self-center">Commencer mon suivi</span>
        </Link>
      </section>

      <section className="grid justify-items-center gap-5 px-6 py-24 text-center sm:py-32">
        <p className={`${caption} text-taupe`}>Communauté</p>
        <p className="display max-w-2xl text-3xl sm:text-4xl">Tes jumelles capillaires : même texture, même porosité.</p>
        <Link href="/jumelles" className="link-cta">Les rencontrer</Link>
      </section>
    </div>
  )
}
