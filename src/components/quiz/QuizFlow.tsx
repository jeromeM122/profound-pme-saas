'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition, type ChangeEvent } from 'react'
import { Wave } from '@/components/brand/Wave'
import type { BudgetTier, HairGoal, HairTexture, Porosity, ScalpType } from '@/generated/prisma/enums'
import { BUDGET, GOALS, MAX_GOALS, POROSITY, SCALP, TEXTURE_FAMILIES, TEXTURES, type TextureFamily } from '@/lib/hair/options'
import { computeDiagnostic } from '@/lib/hair/engine'
import { quizAnswersSchema } from '@/lib/validators/quiz'
import { submitQuiz } from '@/app/diagnostic/actions'

type Draft = { texture?: HairTexture; porosity?: Porosity; scalp?: ScalpType; goals: HairGoal[]; budget?: BudgetTier }
const STEPS = ['Texture', 'Porosité', 'Cuir chevelu', 'Objectifs', 'Budget', 'Récap'] as const
const DRAFT_KEY = 'tresser.quiz.draft'

const entries = <K extends string, V>(o: Record<K, V>) => Object.entries(o) as [K, V][]

function loadDraft(): { step: number; draft: Draft } | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as { step?: unknown; draft?: Draft }
    const partial = quizAnswersSchema.partial().safeParse(v.draft)
    if (!partial.success) return null
    const step = typeof v.step === 'number' && v.step >= 0 && v.step < STEPS.length ? v.step : 0
    return { step, draft: { goals: [], ...partial.data } }
  } catch {
    return null
  }
}

export function QuizFlow() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>({ goals: [] })
  const [family, setFamily] = useState<TextureFamily | null>(null)
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const restored = useRef(false)

  // Restore an unfinished quiz (per-device convenience only).
  useEffect(() => {
    const saved = loadDraft()
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage once
      setDraft(saved.draft)
      setStep(saved.step)
      if (saved.draft.texture) setFamily(TEXTURES[saved.draft.texture].family)
    }
    restored.current = true
  }, [])

  useEffect(() => {
    if (!restored.current) return
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, draft }))
    } catch {
      /* storage unavailable: ignore */
    }
  }, [step, draft])

  // Move focus to the new question for screen-reader and keyboard users.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [step])

  const go = (n: number) => setStep(Math.max(0, Math.min(STEPS.length - 1, n)))
  /** Auto-advance only for real taps/clicks (MouseEvent.detail > 0), never for keyboard navigation. */
  const pick = <K extends keyof Draft>(key: K, value: Draft[K], e: ChangeEvent<HTMLInputElement>) => {
    setDraft((d) => ({ ...d, [key]: value }))
    const native = e.nativeEvent
    if (native instanceof MouseEvent && native.detail > 0) setTimeout(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), 220)
  }
  const toggleGoal = (g: HairGoal) =>
    setDraft((d) => {
      if (d.goals.includes(g)) return { ...d, goals: d.goals.filter((x) => x !== g) }
      if (d.goals.length >= MAX_GOALS) return d
      return { ...d, goals: [...d.goals, g] }
    })

  const answers = quizAnswersSchema.safeParse(draft)
  const canNext = [!!draft.texture, !!draft.porosity, !!draft.scalp, draft.goals.length > 0, !!draft.budget, answers.success && consent][step]

  const submit = () => {
    if (!answers.success || !consent) return
    setError(null)
    startTransition(async () => {
      const r = await submitQuiz({ ...answers.data, consent: true })
      if (!r.ok) return setError(r.error)
      try {
        window.localStorage.removeItem(DRAFT_KEY)
      } catch {
        /* ignore */
      }
      router.push('/diagnostic/resultat')
    })
  }

  const option = (name: string, checked: boolean, onChange: (e: ChangeEvent<HTMLInputElement>) => void, title: string, hint?: string, type: 'radio' | 'checkbox' = 'radio', disabled = false) => (
    <label
      key={title}
      className={`group flex min-h-16 cursor-pointer items-center justify-between gap-4 border px-5 py-4 transition-colors duration-300 ease-brand has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-or ${
        checked ? 'border-or bg-champagne text-encre' : 'border-encre/20 hover:border-or'
      } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
    >
      <span className="grid gap-0.5">
        <span className="text-lg font-normal">{title}</span>
        {hint && <span className={`text-sm ${checked ? 'text-encre/70' : 'text-taupe'}`}>{hint}</span>}
      </span>
      <input type={type} name={name} checked={checked} onChange={onChange} disabled={disabled} className="sr-only" />
      <span aria-hidden className={`grid size-6 shrink-0 place-items-center rounded-full border-2 ${checked ? 'border-encre bg-encre' : 'border-encre/40'}`}>
        {checked && <span className="size-2 rounded-full bg-champagne" />}
      </span>
    </label>
  )

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-8">
      {/* Progress */}
      <div className="grid gap-3">
        <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label="Progression du diagnostic">
          {STEPS.map((s, i) => (
            <span key={s} className={`h-px flex-1 transition-colors duration-700 ${i <= step ? 'bg-or' : 'bg-encre/15'}`} />
          ))}
        </div>
        <p className="kicker text-taupe">
          Étape {step + 1}/{STEPS.length} — {STEPS[step]}
        </p>
      </div>

      <div key={step} className="grid gap-6 animate-step-in">
        {step === 0 && (
          <fieldset className="grid gap-6">
            <legend className="contents">
              <h1 ref={headingRef} tabIndex={-1} className="display text-4xl outline-none sm:text-6xl">
                Ta <span className="accent">texture</span> ?
              </h1>
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {TEXTURE_FAMILIES.map((f) => (
                <button
                  key={f.family}
                  type="button"
                  aria-pressed={family === f.family}
                  onClick={() => setFamily(f.family)}
                  className={`grid gap-3 border p-4 text-left transition-colors duration-300 ease-brand ${
                    family === f.family ? 'border-or bg-champagne text-encre' : 'border-encre/20 hover:border-or'
                  }`}
                >
                  <Wave name={f.wave} width={96} className={family === f.family ? 'text-encre' : 'text-or'} />
                  <span className="text-lg font-normal uppercase">{f.title}</span>
                  <span className={`text-sm ${family === f.family ? 'text-encre/70' : 'text-taupe'}`}>{f.hint}</span>
                </button>
              ))}
            </div>
            {family && (
              <div className="grid gap-3 animate-step-in" role="radiogroup" aria-label="Précise ta texture">
                <p className="kicker text-taupe">Précise</p>
                {entries(TEXTURES)
                  .filter(([, t]) => t.family === family)
                  .map(([key, t]) => option('texture', draft.texture === key, (e) => pick('texture', key, e), `${t.code} — ${t.label}`))}
              </div>
            )}
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="grid gap-3">
            <legend className="contents">
              <h1 ref={headingRef} tabIndex={-1} className="display mb-3 text-4xl outline-none sm:text-6xl">
                Après un shampoing, tes cheveux <span className="accent">sèchent</span>…
              </h1>
            </legend>
            {entries(POROSITY).map(([key, p]) => option('porosity', draft.porosity === key, (e) => pick('porosity', key, e), p.answer, key === 'UNKNOWN' ? undefined : p.label))}
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="grid gap-3">
            <legend className="contents">
              <h1 ref={headingRef} tabIndex={-1} className="display mb-3 text-4xl outline-none sm:text-6xl">
                Ton <span className="accent">cuir chevelu</span> ?
              </h1>
            </legend>
            {entries(SCALP).map(([key, s]) => option('scalp', draft.scalp === key, (e) => pick('scalp', key, e), s.label, s.hint))}
          </fieldset>
        )}

        {step === 3 && (
          <fieldset className="grid gap-3">
            <legend className="contents">
              <h1 ref={headingRef} tabIndex={-1} className="display mb-1 text-4xl outline-none sm:text-6xl">
                Tes <span className="accent">objectifs</span> ?
              </h1>
            </legend>
            <p className="text-taupe">Jusqu’à {MAX_GOALS}. Le premier choisi devient ta routine principale.</p>
            {entries(GOALS).map(([key, g]) => {
              const checked = draft.goals.includes(key)
              const rank = draft.goals.indexOf(key)
              return option('goals', checked, () => toggleGoal(key), g.label, checked ? (rank === 0 ? 'Routine principale' : `Choix n°${rank + 1}`) : undefined, 'checkbox', !checked && draft.goals.length >= MAX_GOALS)
            })}
          </fieldset>
        )}

        {step === 4 && (
          <fieldset className="grid gap-3">
            <legend className="contents">
              <h1 ref={headingRef} tabIndex={-1} className="display mb-3 text-4xl outline-none sm:text-6xl">
                Ton <span className="accent">budget</span> ?
              </h1>
            </legend>
            {entries(BUDGET).map(([key, b]) => option('budget', draft.budget === key, (e) => pick('budget', key, e), b.label, b.hint))}
          </fieldset>
        )}

        {step === 5 && (
          <div className="grid gap-6">
            <h1 ref={headingRef} tabIndex={-1} className="display text-4xl outline-none sm:text-6xl">
              Ton <span className="accent">profil</span>
            </h1>
            {answers.success ? (
              <p className="w-fit bg-champagne px-4 py-3 font-mono text-base font-normal text-encre sm:text-lg">{computeDiagnostic(answers.data).badge}</p>
            ) : (
              <p className="text-taupe">Il manque des réponses : reviens aux étapes précédentes.</p>
            )}
            <label className="flex cursor-pointer items-start gap-3 border border-encre/20 p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-or">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-5 shrink-0 accent-or" />
              <span className="text-sm text-encre/80">
                J’accepte que tresser.fr enregistre ces réponses pour personnaliser mes recommandations. Elles restent privées, sauf si je choisis
                d’afficher mon badge sur mon profil. Je peux les supprimer à tout moment depuis mon compte.
              </span>
            </label>
            {error && (
              <p role="alert" className="bg-champagne px-4 py-3 text-sm font-normal text-encre">
                {error}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className="btn-ghost disabled:invisible">
          Retour
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={() => go(step + 1)} disabled={!canNext} className="btn-primary">
            Continuer
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={!canNext || pending} className="btn-primary">
            {pending ? 'Analyse…' : 'Voir mon diagnostic'}
          </button>
        )}
      </div>
    </div>
  )
}
