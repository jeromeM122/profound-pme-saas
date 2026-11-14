'use client'

import { upload } from '@vercel/blob/client'
import { useActionState, useState, useTransition } from 'react'
import { prepareVideoUpload, submitVideo, type VideoState } from '@/app/videos/actions'
import { TEXTURES } from '@/lib/hair/options'

type Props = { productSlug?: string; path: string; defaultTexture?: string | null }

export function VideoSubmit({ productSlug, path, defaultTexture }: Props) {
  const [mode, setMode] = useState<'link' | 'upload'>('link')
  const [state, action] = useActionState<VideoState, FormData>(submitVideo, {})
  const [pending, start] = useTransition()
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    start(async () => {
      if (mode === 'upload') {
        const file = fd.get('file')
        if (!(file instanceof File) || file.size === 0) return setError('Choisis une vidéo.')
        const prep = await prepareVideoUpload(file.type, file.size)
        if ('error' in prep) return setError(prep.error)
        try {
          setProgress(0)
          if (prep.mode === 'blob') {
            await upload(prep.key, file, { access: 'private', handleUploadUrl: '/api/media/video-token', contentType: file.type, onUploadProgress: (p) => setProgress(Math.round(p.percentage)) })
          } else {
            const local = new FormData()
            local.set('key', prep.key)
            local.set('file', file)
            const r = await fetch('/api/media/video-local', { method: 'POST', body: local })
            if (!r.ok) throw new Error('upload failed')
          }
        } catch {
          setProgress(null)
          return setError('L’envoi a échoué. Vérifie ta connexion et réessaie.')
        }
        fd.delete('file')
        fd.set('key', prep.key)
      }
      setProgress(null)
      action(fd)
      form.reset()
    })
  }

  const tab = (m: 'link' | 'upload', label: string) => (
    <button type="button" onClick={() => setMode(m)} aria-pressed={mode === m} className={`kicker border-b-2 pb-2 text-[0.6rem] ${mode === m ? 'border-or text-encre' : 'border-transparent text-taupe hover:text-encre'}`}>
      {label}
    </button>
  )

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <input type="hidden" name="kind" value={mode} />
      <input type="hidden" name="path" value={path} />
      {productSlug && <input type="hidden" name="productSlug" value={productSlug} />}
      <div className="flex gap-6">
        {tab('link', 'Lien TikTok / Instagram / YouTube')}
        {tab('upload', 'Envoyer ma vidéo')}
      </div>
      {mode === 'link' ? (
        <label className="grid gap-1 text-sm">
          Lien de la vidéo
          <input name="url" type="url" inputMode="url" maxLength={300} required placeholder="https://www.tiktok.com/@pseudo/video/…" className="field" />
          <span className="text-xs text-taupe">Lien complet d’une vidéo TikTok, d’un Reel Instagram ou d’un Short YouTube.</span>
        </label>
      ) : (
        <label className="grid gap-1 text-sm">
          Fichier vidéo (MP4, MOV ou WebM, 60 Mo max)
          <input name="file" type="file" accept="video/mp4,video/quicktime,video/webm" required className="text-sm file:mr-4 file:border file:border-encre/60 file:bg-transparent file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-widest" />
        </label>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Ta texture
          <select name="texture" defaultValue={defaultTexture ?? ''} className="field">
            <option value="">Je ne sais pas</option>
            {Object.entries(TEXTURES).map(([k, t]) => (
              <option key={k} value={k}>
                {t.code} — {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Légende (facultatif)
          <input name="caption" maxLength={200} placeholder="Application sur cheveux mouillés…" className="field" />
        </label>
      </div>
      <label className="flex items-start gap-3 text-xs text-taupe">
        <input type="checkbox" name="consent" required className="mt-0.5 size-4 accent-or" />
        Je suis l’auteur·e de cette vidéo (ou j’ai l’accord de la personne filmée) et j’accepte qu’elle soit affichée sur tresser.fr après validation.
      </label>
      {progress !== null && (
        <div className="h-px w-full bg-ligne" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Envoi de la vidéo">
          <div className="h-px bg-or transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      {(error || state.message) && (
        <p role="status" className={`text-sm ${state.ok && !error ? 'text-or' : 'text-encre'}`}>
          {error ?? state.message}
        </p>
      )}
      <button disabled={pending} className="btn-primary w-fit">
        {pending ? (progress !== null ? `Envoi… ${progress} %` : 'Envoi…') : 'Partager la vidéo'}
      </button>
    </form>
  )
}
