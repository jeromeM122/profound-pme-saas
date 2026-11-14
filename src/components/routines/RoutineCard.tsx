import Image from 'next/image'
import Link from 'next/link'
import { CATEGORY_LABEL, type Match, type RoutineData } from '@/content/routines'
import { MatchBadge } from './MatchBadge'

export function RoutineCard({ routine: r, match, priority = false }: { routine: RoutineData; match: Match | null; priority?: boolean }) {
  const img = r.heroMobile ?? r.hero
  return (
    <Link href={`/routines/${r.slug}`} className="group grid gap-4">
      <div className="relative overflow-hidden bg-sable">
        {img && (
          <Image
            src={img.src}
            width={img.w}
            height={img.h}
            alt={`${r.name}, ${r.kicker.toLowerCase()}`}
            priority={priority}
            sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 90vw"
            className="aspect-[3/4] w-full object-cover transition-transform duration-[1.4s] ease-brand group-hover:scale-[1.04]"
          />
        )}
        {match && (
          <div className="absolute top-3 left-3">
            <MatchBadge match={match} size="sm" />
          </div>
        )}
      </div>
      <div className="grid gap-1.5">
        <p className="kicker text-[0.6rem] text-or">{r.categories.map((c) => CATEGORY_LABEL[c]).join(' · ') || r.kicker}</p>
        <h3 className="text-xl leading-snug">{r.title}</h3>
        {r.quote && <p className="line-clamp-2 text-sm text-taupe">« {r.quote} »</p>}
        <p className="kicker mt-1 text-[0.58rem] text-taupe transition-colors group-hover:text-encre">
          {r.steps.length} étape{r.steps.length > 1 ? 's' : ''} · Voir la routine →
        </p>
      </div>
    </Link>
  )
}
