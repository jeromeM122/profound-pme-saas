'use client'

import { useState } from 'react'

export type FacadeVideo = {
  id: string
  source: 'TIKTOK' | 'INSTAGRAM' | 'YOUTUBE' | 'UPLOAD'
  /** Embed URL (validated server-side) or private media URL for uploads */
  src: string
  sourceLabel: string
  handle: string | null
  caption: string | null
  textureCode: string | null
  pending?: boolean
}

/**
 * Click-to-play facade: nothing is requested from TikTok / Instagram / YouTube until the visitor
 * clicks (performance + privacy). Uploaded videos stream from our own auth-checked media route.
 */
export function VideoFacade({ video: v }: { video: FacadeVideo }) {
  const [playing, setPlaying] = useState(false)
  return (
    <figure className="grid gap-2">
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-encre">
        {playing ? (
          v.source === 'UPLOAD' ? (
            <video src={v.src} controls autoPlay playsInline preload="metadata" className="h-full w-full object-cover">
              <track kind="captions" />
            </video>
          ) : (
            <iframe
              src={v.src}
              title={`Vidéo ${v.sourceLabel}${v.handle ? ` de @${v.handle}` : ''}`}
              className="h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
              loading="lazy"
            />
          )
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group grid h-full w-full content-between bg-encre p-4 text-left text-creme"
            aria-label={`Lire la vidéo ${v.sourceLabel}${v.handle ? ` de @${v.handle}` : ''}`}
          >
            <span className="kicker text-[0.55rem] text-or-clair">{v.sourceLabel}</span>
            <span className="mx-auto grid size-16 place-items-center rounded-full border border-or-clair bg-creme/10 transition-transform duration-500 group-hover:scale-110">
              <span className="ml-1 size-0 border-y-[9px] border-l-[15px] border-y-transparent border-l-creme" />
            </span>
            <span className="grid gap-1">
              {v.handle && <span className="text-sm">@{v.handle}</span>}
              {v.source !== 'UPLOAD' && <span className="text-[0.62rem] text-creme/60">Lecture chargée depuis {v.sourceLabel} au clic</span>}
            </span>
          </button>
        )}
        {v.pending && <span className="kicker absolute top-2 right-2 bg-champagne px-2 py-1 text-[0.5rem] text-encre">En attente de validation</span>}
      </div>
      <figcaption className="grid gap-0.5">
        {v.textureCode && <span className="kicker text-[0.55rem] text-or">Cheveux {v.textureCode}</span>}
        {v.caption && <span className="line-clamp-2 text-sm">{v.caption}</span>}
      </figcaption>
    </figure>
  )
}
