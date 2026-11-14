import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { JourneySteps } from '@/components/journey/JourneySteps'
import { BeforeAfter } from '@/components/progress/BeforeAfter'
import { ProgressUploader } from '@/components/progress/ProgressUploader'
import { db } from '@/server/db'
import { requireUser } from '@/server/guards'
import { deleteProgress } from './actions'

export const metadata: Metadata = { title: 'Mon suivi', robots: { index: false } }

const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const METRICS = [
  { key: 'hydration', label: 'Hydratation' },
  { key: 'definition', label: 'Définition' },
  { key: 'breakage', label: 'Casse', hint: '5 = aucune' },
] as const

export default async function SuiviPage() {
  const me = await requireUser('/ma-routine/suivi')
  const entries = await db.progressEntry.findMany({ where: { userId: me.id }, orderBy: [{ takenAt: 'asc' }, { createdAt: 'asc' }] })
  const first = entries[0]
  const last = entries.at(-1)
  const days = first && last ? Math.round((last.takenAt.getTime() - first.takenAt.getTime()) / 86_400_000) : 0
  const shot = (e: (typeof entries)[number]) => ({ src: `/api/media/${e.photoKey}`, date: fmt(e.takenAt), w: e.width, h: e.height })
  const firstWith = (k: (typeof METRICS)[number]['key']) => entries.find((e) => e[k] != null)?.[k] ?? null
  const lastWith = (k: (typeof METRICS)[number]['key']) => [...entries].reverse().find((e) => e[k] != null)?.[k] ?? null

  return (
    <div className="pb-24">
      <JourneySteps current={4} done={4} />
      <section className="mx-auto grid max-w-6xl gap-4 px-4 pt-14 pb-10 sm:px-8">
        <p className="kicker text-or">Mon suivi</p>
        <h1 className="display text-4xl sm:text-6xl">
          Tes cheveux, <span className="accent">semaine après semaine</span>
        </h1>
        <p className="max-w-2xl text-taupe">Une photo à chaque wash day, quelques notes : tu verras ce que ta routine change vraiment. Tout reste privé.</p>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-8 lg:grid-cols-[1.1fr_1fr]">
        <section aria-labelledby="comparaison" className="grid content-start gap-6">
          <h2 id="comparaison" className="kicker text-encre">Avant / après</h2>
          {first && last && first.id !== last.id ? (
            <>
              <BeforeAfter before={shot(first)} after={shot(last)} />
              <p className="text-sm text-taupe">
                {days} jour{days > 1 ? 's' : ''} entre ta première et ta dernière photo · {entries.length} photos au total
              </p>
              <dl className="grid grid-cols-3 gap-px bg-ligne">
                {METRICS.map((m) => {
                  const a = firstWith(m.key)
                  const b = lastWith(m.key)
                  const delta = a != null && b != null ? b - a : null
                  return (
                    <div key={m.key} className="grid gap-1 bg-perle p-4">
                      <dt className="kicker text-[0.55rem] text-taupe">
                        {m.label}
                        {'hint' in m ? ` (${m.hint})` : ''}
                      </dt>
                      <dd className="text-2xl font-light">
                        {a ?? '–'} → {b ?? '–'}
                        {delta != null && delta !== 0 && <span className={`ml-2 text-sm ${delta > 0 ? 'text-or' : 'text-taupe'}`}>{delta > 0 ? `+${delta}` : delta}</span>}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </>
          ) : (
            <div className="grid aspect-[4/5] place-items-center border border-dashed border-ligne bg-perle p-8 text-center">
              <p className="max-w-xs text-taupe">
                {entries.length === 0 ? 'Ajoute ta première photo : ce sera ton « avant ».' : 'Encore une photo et la comparaison avant / après apparaîtra ici.'}
              </p>
            </div>
          )}
        </section>

        <section aria-labelledby="ajout" className="grid content-start gap-6 border border-ligne bg-perle p-6">
          <h2 id="ajout" className="kicker text-encre">Nouvelle photo</h2>
          <ProgressUploader />
        </section>
      </div>

      {entries.length > 0 && (
        <section aria-labelledby="journal" className="mx-auto mt-20 max-w-6xl px-4 sm:px-8">
          <h2 id="journal" className="display mb-8 text-3xl">
            Mon <span className="accent">journal</span>
          </h2>
          <ol className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...entries].reverse().map((e) => (
              <li key={e.id} className="grid gap-2">
                <Image src={`/api/media/${e.photoKey}`} width={e.width} height={e.height} alt={`Photo du ${fmt(e.takenAt)}`} unoptimized className="aspect-[4/5] w-full bg-sable object-cover" />
                <div className="flex items-start justify-between gap-2">
                  <div className="grid gap-0.5">
                    <p className="kicker text-[0.55rem] text-or">{fmt(e.takenAt)}</p>
                    {e.note && <p className="line-clamp-2 text-sm">{e.note}</p>}
                  </div>
                  <form action={deleteProgress}>
                    <input type="hidden" name="id" value={e.id} />
                    <button className="kicker text-[0.5rem] text-taupe hover:text-encre" aria-label={`Supprimer la photo du ${fmt(e.takenAt)}`}>
                      Supprimer
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mx-auto mt-16 max-w-6xl px-4 text-sm text-taupe sm:px-8">
        <Link href="/ma-routine" className="underline underline-offset-4 hover:text-or">← Retour à ma routine</Link>
      </p>
    </div>
  )
}
