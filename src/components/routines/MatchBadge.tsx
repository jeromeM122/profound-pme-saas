import type { Match } from '@/content/routines'

/** Personal fit indicator — only shown when the visitor has a diagnostic. */
export function MatchBadge({ match, size = 'md' }: { match: Match; size?: 'sm' | 'md' }) {
  const strong = match.score >= 75
  return (
    <p
      className={`inline-flex w-fit items-center gap-2 border ${strong ? 'border-or bg-champagne' : 'border-ligne bg-perle'} ${size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5'}`}
      aria-label={`Correspondance avec ton profil : ${match.score} %. ${match.label}`}
    >
      <span className={`font-mono ${size === 'sm' ? 'text-[0.62rem]' : 'text-xs'} text-or`}>{match.score} %</span>
      <span className={`kicker ${size === 'sm' ? 'text-[0.55rem]' : 'text-[0.6rem]'} text-encre`}>{match.label}</span>
    </p>
  )
}
