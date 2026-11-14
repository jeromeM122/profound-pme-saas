'use client'

import { useActionState, useRef, useState, useTransition } from 'react'
import { addProgress, type ProgressState } from '@/app/ma-routine/suivi/actions'

const RATINGS = [
  { name: 'hydration', label: 'Hydratation' },
  { name: 'definition', label: 'Définition' },
  { name: 'breakage', label: 'Casse (1 = beaucoup, 5 = aucune)' },
] as const

/** Downscales in the browser (≤ 2000 px JPEG) so uploads stay small; the server re-encodes and strips metadata. */
async function downscale(file: File): Promise<File> {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bmp.width * scale)
    canvas.height = Math.round(bmp.height * scale)
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.88))
    return blob ? new File([blob], 'photo.jpg', { type: 'image/jpeg' }) : file
  } catch {
    return file // e.g. HEIC not decodable by this browser: the server handles it
  }
}

export function ProgressUploader() {
  const [state, action] = useActionState<ProgressState, FormData>(addProgress, {})
  const [pending, start] = useTransition()
  const [preview, setPreview] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const today = new Date().toISOString().slice(0, 10)

  return (
    <form
      ref={formRef}
      className="grid gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        const file = fd.get('photo')
        start(async () => {
          if (file instanceof File && file.size > 0) fd.set('photo', await downscale(file))
          action(fd)
          formRef.current?.reset()
          setPreview(null)
        })
      }}
    >
      <label className="grid cursor-pointer place-items-center gap-3 border border-dashed border-or-clair bg-creme p-6 text-center hover:border-or">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
          <img src={preview} alt="Aperçu de la photo" className="max-h-56 object-contain" />
        ) : (
          <>
            <span className="kicker text-or">Ajouter une photo</span>
            <span className="text-sm text-taupe">Même lumière, même angle à chaque fois pour bien comparer.</span>
          </>
        )}
        <input
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          required
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0]
            setPreview(f ? URL.createObjectURL(f) : null)
          }}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Date
          <input name="takenAt" type="date" defaultValue={today} max={today} required className="field" />
        </label>
        <label className="grid gap-1 text-sm">
          Note (facultatif)
          <input name="note" maxLength={500} placeholder="Wash day, nouveau masque…" className="field" />
        </label>
      </div>
      <fieldset className="grid gap-3">
        <legend className="kicker mb-2 text-[0.6rem] text-taupe">Comment sont tes cheveux ? (facultatif)</legend>
        {RATINGS.map((r) => (
          <div key={r.name} className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm">{r.label}</span>
            <div className="flex gap-1" role="radiogroup" aria-label={r.label}>
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="cursor-pointer">
                  <input type="radio" name={r.name} value={n} className="peer sr-only" />
                  <span className="grid size-9 place-items-center border border-ligne font-mono text-xs peer-checked:border-or peer-checked:bg-champagne peer-focus-visible:outline-1 peer-focus-visible:outline-or">
                    {n}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </fieldset>
      {state.message && (
        <p role="status" className={`text-sm ${state.ok ? 'text-or' : 'text-encre'}`}>
          {state.message}
        </p>
      )}
      <button disabled={pending} className="btn-primary w-fit">
        {pending ? 'Envoi…' : 'Ajouter à mon suivi'}
      </button>
      <p className="text-xs text-taupe">Tes photos sont privées : elles ne sont visibles que par toi. Les informations de localisation sont supprimées.</p>
    </form>
  )
}
