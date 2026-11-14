'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { scanHair } from '@/app/scan/actions'
import type { ScanResult } from '@/server/scan/analyze'
import { GOALS, TEXTURES } from '@/lib/hair/options'

const DRAFT_KEY = 'tresser.quiz.draft'
const CONFIDENCE = { low: 'Estimation prudente', medium: 'Estimation fiable', high: 'Estimation très fiable' } as const

async function downscale(file: File): Promise<File> {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * scale)
    c.height = Math.round(bmp.height * scale)
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/jpeg', 0.88))
    return blob ? new File([blob], 'scan.jpg', { type: 'image/jpeg' }) : file
  } catch {
    return file
  }
}

export function HairScanner({ available }: { available: boolean }) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const analyse = () => {
    if (!file) return
    setError(null)
    start(async () => {
      const fd = new FormData()
      fd.set('photo', await downscale(file))
      fd.set('consent', consent ? 'on' : '')
      const r = await scanHair(fd)
      if (!r.ok) return setError(r.error)
      setResult(r.result)
    })
  }

  const continueToQuiz = () => {
    if (!result?.texture) return
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ step: 1, draft: { texture: result.texture, goals: result.likelyNeeds } }))
    } catch {
      /* storage unavailable: the quiz will simply start at step 1 */
    }
    router.push('/diagnostic?from=scan')
  }

  if (!available) {
    return (
      <div className="grid gap-4 rounded-3xl border border-ligne bg-perle p-8 text-center">
        <p className="text-lg">Le scan photo arrive très bientôt.</p>
        <p className="text-taupe">En attendant, ton diagnostic en 6 questions donne le même résultat.</p>
        <Link href="/diagnostic" className="btn-primary mx-auto">Faire le diagnostic</Link>
      </div>
    )
  }

  if (result) {
    const t = result.texture ? TEXTURES[result.texture] : null
    return (
      <div className="grid gap-6">
        <div className="relative overflow-hidden rounded-3xl bg-encre text-creme">
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL, never uploaded for display */}
          {preview && <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />}
          <div className="relative grid gap-3 p-8 text-center">
            <p className="kicker text-or-clair">{t ? 'Ta texture' : 'Résultat'}</p>
            {t ? (
              <>
                <p className="display text-7xl sm:text-8xl">{t.code}</p>
                <p className="text-lg">{t.label}</p>
                <p className="kicker mx-auto w-fit rounded-full border border-or-clair/60 px-3 py-1 text-[0.58rem] text-or-clair">{CONFIDENCE[result.confidence]}</p>
              </>
            ) : (
              <p className="text-lg">On n’a pas pu lire ta texture sur cette photo.</p>
            )}
          </div>
        </div>
        <p className="text-lg leading-relaxed">{result.pattern}</p>
        {result.observations.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Observations">
            {result.observations.map((o) => (
              <li key={o} className="rounded-full border border-ligne bg-perle px-4 py-2 text-sm">{o}</li>
            ))}
          </ul>
        )}
        {result.likelyNeeds.length > 0 && (
          <p className="text-sm text-taupe">
            Besoins probables : {result.likelyNeeds.map((g) => GOALS[g].label.toLowerCase()).join(', ')}.
          </p>
        )}
        {result.photoTip && <p className="rounded-2xl bg-champagne px-4 py-3 text-sm">Astuce : {result.photoTip}</p>}
        <div className="grid gap-3 sm:flex">
          {t ? (
            <button type="button" onClick={continueToQuiz} className="btn-primary">
              Continuer — 4 questions
            </button>
          ) : null}
          <button type="button" onClick={() => { setResult(null); setFile(null); setPreview(null) }} className="btn-ghost">
            Reprendre une photo
          </button>
          <Link href="/diagnostic" className="btn-ghost">
            Choisir moi-même
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <label className={`relative grid aspect-[4/5] w-full cursor-pointer place-items-center overflow-hidden rounded-3xl border border-or-clair/70 bg-perle text-center ${pending ? 'pointer-events-none' : ''}`}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
          <img src={preview} alt="Ta photo" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="grid justify-items-center gap-4 p-8">
            <span className="grid size-20 place-items-center rounded-full bg-encre text-creme">
              <CameraIcon />
            </span>
            <span className="text-lg">Prendre ou choisir une photo</span>
            <span className="max-w-xs text-sm text-taupe">Lumière naturelle, cheveux secs, de dos ou de profil. Ton visage n’est pas nécessaire.</span>
          </span>
        )}
        {pending && (
          <span aria-hidden className="absolute inset-x-0 top-0 h-1/3 animate-scan bg-gradient-to-b from-transparent via-or-clair/60 to-transparent" />
        )}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null
            setFile(f)
            setPreview(f ? URL.createObjectURL(f) : null)
            setError(null)
          }}
        />
      </label>
      <label className="flex items-start gap-3 text-sm text-taupe">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-5 accent-or" />
        J’accepte que ma photo soit analysée par une intelligence artificielle pour estimer ma texture. Elle n’est pas conservée par tresser.fr.
      </label>
      {error && <p role="alert" className="rounded-2xl bg-champagne px-4 py-3 text-sm">{error}</p>}
      <button type="button" onClick={analyse} disabled={!file || !consent || pending} className="btn-primary">
        {pending ? 'Analyse en cours…' : 'Analyser mes cheveux'}
      </button>
      <p className="text-center text-sm text-taupe">
        Pas de photo sous la main ? <Link href="/diagnostic" className="underline underline-offset-4 hover:text-or">Réponds à 6 questions</Link>
      </p>
    </div>
  )
}

export function CameraIcon({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden>
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.6l1.2-1.8A1.5 1.5 0 0 1 9.55 3.5h4.9a1.5 1.5 0 0 1 1.25.7L16.9 6h1.6A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-9Z" />
      <circle cx="12" cy="12.5" r="3.75" />
    </svg>
  )
}
