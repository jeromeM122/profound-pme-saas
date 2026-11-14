import Image from 'next/image'
import Link from 'next/link'
import type { CatalogProduct } from '@/content/catalog'
import type { Match } from '@/content/routines'
import { MatchBadge } from '@/components/routines/MatchBadge'

export function ProductCard({ product: p, match }: { product: CatalogProduct; match: Match | null }) {
  return (
    <Link href={`/produits/${p.slug}` as '/produits'} className="group grid gap-3">
      <div className="relative overflow-hidden bg-perle">
        {p.image ? (
          <Image src={p.image.src} width={p.image.w} height={p.image.h} alt={p.name} sizes="(min-width: 1024px) 22vw, 45vw" className="aspect-square w-full object-cover transition-transform duration-[1.4s] ease-brand group-hover:scale-[1.04]" />
        ) : (
          <div className="grid aspect-square place-items-center text-taupe">—</div>
        )}
        {match && (
          <div className="absolute top-2 left-2">
            <MatchBadge match={match} size="sm" />
          </div>
        )}
      </div>
      <div className="grid gap-1">
        <p className="kicker truncate text-[0.58rem] text-or">{p.brand ?? p.offer?.merchantName ?? 'Sélection communauté'}</p>
        <h3 className="line-clamp-2 leading-snug">{p.name}</h3>
        <p className="kicker text-[0.55rem] text-taupe">
          Dans {p.usages.length} routine{p.usages.length > 1 ? 's' : ''}
        </p>
      </div>
    </Link>
  )
}
