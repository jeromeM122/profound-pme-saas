import type { Match } from '@/content/routines'

/** Personal fit indicator — plain text, no chrome. Only shown when the visitor has a diagnostic. */
export function MatchBadge({ match, size = 'md' }: { match: Match; size?: 'sm' | 'md' }) {
  return (
    <p
      className={`inline-flex w-fit items-baseline gap-2 bg-white/90 uppercase tracking-[0.14em] text-encre ${size === 'sm' ? 'px-2 py-1 text-[0.56rem]' : 'px-0 py-0 text-[0.64rem]'}`}
      aria-label={`Correspondance avec ton profil : ${match.score} %. ${match.label}`}
    >
      <span>{match.score} %</span>
      <span className="text-taupe">{match.label}</span>
    </p>
  )
}
