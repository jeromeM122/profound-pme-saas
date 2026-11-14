'use client'

import { useState } from 'react'

type Shot = { src: string; date: string; w: number; h: number }

/** Before / after comparison with a draggable (and keyboard-accessible) divider. */
export function BeforeAfter({ before, after }: { before: Shot; after: Shot }) {
  const [pos, setPos] = useState(50)
  return (
    <figure className="grid gap-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-sable select-none">
        {/* eslint-disable-next-line @next/next/no-img-element -- private, auth-checked media route */}
        <img src={before.src} alt={`Avant — ${before.date}`} className="absolute inset-0 h-full w-full object-cover" />
        {/* eslint-disable-next-line @next/next/no-img-element -- private, auth-checked media route */}
        <img src={after.src} alt={`Après — ${after.date}`} className="absolute inset-0 h-full w-full object-cover" style={{ clipPath: `inset(0 0 0 ${pos}%)` }} />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 w-px bg-creme shadow-[0_0_0_1px_rgb(128_96_40/0.6)]" style={{ left: `${pos}%` }}>
          <span className="absolute top-1/2 left-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-or-clair bg-creme text-or">⇆</span>
        </div>
        <span className="kicker absolute top-3 left-3 bg-creme/90 px-2 py-1 text-[0.55rem]">Avant · {before.date}</span>
        <span className="kicker absolute top-3 right-3 bg-encre/80 px-2 py-1 text-[0.55rem] text-creme">Après · {after.date}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Comparer avant et après"
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
    </figure>
  )
}
