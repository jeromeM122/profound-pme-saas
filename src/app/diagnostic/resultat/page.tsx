import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Wave } from '@/components/brand/Wave'
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

  return (
    <div className="px-4 pt-28 pb-24">
      <section className="mx-auto grid max-w-5xl justify-items-center gap-6 text-center">
        <p className="kicker text-gris">Ton diagnostic</p>
        <h1 className="display text-[22vw] sm:text-[11rem]">
          {t.code}
        </h1>
        <p className="rounded-xl bg-citron px-4 py-3 font-mono text-sm font-bold text-noir sm:text-lg">{d.badge}</p>
        <Wave name="curl" width={200} className="text-citron" />
      </section>

      <section className="mx-auto mt-16 grid max-w-5xl gap-3 md:grid-cols-2">
        <dl className="card grid gap-4">
          {facts.map((f) => (
            <div key={f.k} className="grid gap-1 border-b border-ivoire/10 pb-3 last:border-0 last:pb-0">
              <dt className="kicker text-gris">{f.k}</dt>
              <dd className="text-lg font-bold">{f.v}</dd>
            </div>
          ))}
        </dl>
        <div className="grid content-between gap-6 rounded-3xl bg-bleu p-6 text-blanc">
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
            <Link href="/jumelles" className="btn bg-blanc text-noir hover:bg-citron">
              <ButtonLabel>Voir mes jumelles</ButtonLabel>
            </Link>
          ) : (
            <Link href="/connexion?callbackUrl=%2Fcompte" className="btn bg-blanc text-noir hover:bg-citron">
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
              <p className="font-bold uppercase">{tip.title}</p>
              <p className="text-ivoire/75">{tip.text}</p>
            </li>
          ))}
        </ul>
        <p className="text-sm text-gris">
          Conseils généraux de soin, pas un avis médical.{' '}
          <Link href="/diagnostic" className="underline underline-offset-4 hover:text-citron">
            Refaire le diagnostic
          </Link>
        </p>
      </section>
    </div>
  )
}
