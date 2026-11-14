import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Wave } from '@/components/brand/Wave'
import { JourneySteps } from '@/components/journey/JourneySteps'
import { plannedSteps, STEP_INFO } from '@/content/regimen'
import { ButtonLabel } from '@/components/ui/ButtonLabel'
import { BUDGET, GOALS, POROSITY, SCALP, TEXTURES } from '@/lib/hair/options'
import { routineTips } from '@/lib/hair/tips'
import { auth } from '@/server/auth'
import { getCurrentDiagnostic } from '@/server/hair/profile'
import { countTwins } from '@/server/social/graph'

export const metadata: Metadata = { title: 'Mon diagnostic', robots: { index: false } }

export default async function ResultatPage() {
  const session = await auth()
  const userId = session?.user?.id ?? null
  const d = await getCurrentDiagnostic(userId)
  if (!d) redirect('/diagnostic')
  const twins = await countTwins(d.twinKey, userId)
  const t = TEXTURES[d.texture]

  const facts = [
    { k: 'Texture', v: `${t.code} — ${t.label}` },
    { k: 'Porosité', v: POROSITY[d.porosity].label },
    { k: 'Cuir chevelu', v: SCALP[d.scalp].label },
    { k: 'Objectifs', v: d.goals.map((g) => GOALS[g].label).join(', ') },
    { k: 'Budget', v: `${BUDGET[d.budget].label} (${BUDGET[d.budget].hint.toLowerCase()})` },
  ]

  const steps = plannedSteps({ texture: d.texture, porosity: d.porosity, goals: d.goals })
  return (
    <>
    <JourneySteps current={1} done={1} />
    <div className="px-4 pt-14 pb-24">
      <section className="mx-auto grid max-w-5xl justify-items-center gap-6 text-center">
        <p className="kicker text-taupe">Ton diagnostic</p>
        <h1 className="display text-[22vw] sm:text-[11rem]">
          {t.code}
        </h1>
        <p className="bg-champagne px-4 py-3 font-mono text-sm font-normal text-encre sm:text-lg">{d.badge}</p>
        <Wave name="curl" width={200} className="text-or" />
      </section>

      {/* NEXT STEP — the personal routine */}
      <section className="mx-auto mt-14 grid max-w-5xl gap-6 border border-or-clair bg-perle p-8 md:grid-cols-[1fr_auto] md:items-center">
        <div className="grid gap-3">
          <p className="kicker text-or">Étape suivante</p>
          <p className="display text-3xl">Ta routine sur-mesure <span className="accent">est prête</span></p>
          <ol className="flex flex-wrap gap-2">
            {steps.map((s, i) => (
              <li key={s.type} className="kicker border border-ligne bg-creme px-3 py-1.5 text-[0.58rem] text-taupe">
                {i + 1}. {STEP_INFO[s.type].title}
              </li>
            ))}
          </ol>
        </div>
        <Link href="/ma-routine" className="btn-primary">
          <ButtonLabel>Découvrir ma routine</ButtonLabel>
        </Link>
      </section>

      <section className="mx-auto mt-16 grid max-w-5xl gap-3 md:grid-cols-2">
        <dl className="card grid gap-4">
          {facts.map((f) => (
            <div key={f.k} className="grid gap-1 border-b border-encre/10 pb-3 last:border-0 last:pb-0">
              <dt className="kicker text-taupe">{f.k}</dt>
              <dd className="text-lg font-normal">{f.v}</dd>
            </div>
          ))}
        </dl>
        <div className="grid content-between gap-6 bg-encre p-6 text-creme">
          <div className="grid gap-3">
            <p className="kicker">Jumelles capillaires</p>
            <p className="display text-5xl">
              {twins} <span className="font-light italic">{twins > 1 ? 'profils' : 'profil'}</span>
            </p>
            <p>
              {twins > 0
                ? `membre${twins > 1 ? 's' : ''} partage${twins > 1 ? 'nt' : ''} exactement ton profil ${t.code} • ${POROSITY[d.porosity].label.toLowerCase()}.`
                : 'Sois la première personne de ton profil à rejoindre la communauté.'}
            </p>
          </div>
          {userId ? (
            <Link href="/jumelles" className="btn bg-creme text-encre hover:bg-champagne">
              <ButtonLabel>Voir mes jumelles</ButtonLabel>
            </Link>
          ) : (
            <Link href="/connexion?callbackUrl=%2Fcompte" className="btn bg-creme text-encre hover:bg-champagne">
              <ButtonLabel>Sauvegarder mon profil</ButtonLabel>
            </Link>
          )}
        </div>
      </section>

      <section className="mx-auto mt-16 grid max-w-5xl gap-6">
        <h2 className="display text-4xl sm:text-5xl">
          Ta <span className="accent">routine</span>
        </h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {routineTips(d).map((tip) => (
            <li key={tip.title + tip.text.slice(0, 10)} className="card grid content-start gap-2">
              <p className="font-normal uppercase">{tip.title}</p>
              <p className="text-encre/75">{tip.text}</p>
            </li>
          ))}
        </ul>
        <p className="text-sm text-taupe">
          Conseils généraux de soin, pas un avis médical.{' '}
          <Link href="/diagnostic" className="underline underline-offset-4 hover:text-or">
            Refaire le diagnostic
          </Link>
        </p>
      </section>
    </div>
    </>
  )
}
