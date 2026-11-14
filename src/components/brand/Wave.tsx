import { WAVES, type WaveName } from './wave-paths'

/** Brand graphic element (boucle / vagues). Decorative: hidden from assistive tech. */
export function Wave({ name = 'wave', width = 200, className = '' }: { name?: WaveName; width?: number; className?: string }) {
  const w = WAVES[name]
  const [, , vw, vh] = w.viewBox.split(' ').map(Number) as [number, number, number, number]
  return (
    <svg
      viewBox={w.viewBox}
      width={width}
      height={Math.round((width * vh) / vw)}
      aria-hidden
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={className}
    >
      <path d={w.d} transform={w.transform} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
