import { LOGO_PATHS, LOGO_RATIO, LOGO_VIEWBOX } from './logo-paths'

/**
 * Official tresser.fr wordmark.
 * Charte graphique rules enforced by the API:
 *  - monochrome only: black on light backgrounds, white on dark ones (no other colour, no outline);
 *  - proportions are locked (width derived from height, never stretched or compressed);
 *  - minimum size: 12 mm ≈ 46 px wide → height ≥ 8 px; we use ≥ 20 px on screen;
 *  - clear space of « 1e » around it is provided by callers (see SiteHeader / SiteFooter padding).
 */
type Props = { tone?: 'noir' | 'blanc'; height?: number; className?: string; title?: string }

export function Logo({ tone = 'noir', height = 28, className = '', title = 'tresser.fr' }: Props) {
  const h = Math.max(20, height)
  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      width={Math.round(h * LOGO_RATIO)}
      height={h}
      role="img"
      aria-label={title}
      fill="currentColor"
      className={`${tone === 'blanc' ? 'text-white' : 'text-black'} shrink-0 ${className}`}
    >
      {LOGO_PATHS.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}
