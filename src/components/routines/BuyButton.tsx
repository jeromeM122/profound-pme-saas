import { goHref, type Offer } from '@/content/catalog'

/** Purchase link through /go (click tracked server-side, then redirect to the shop in a new tab). */
export function BuyButton({ offer, from, variant = 'primary', className = '', compact = false }: { offer: Offer | null | undefined; from: string; variant?: 'primary' | 'ghost' | 'link'; className?: string; compact?: boolean }) {
  if (!offer) return null
  const href = goHref(offer, from)
  const isSocial = offer.host.includes('instagram')
  if (variant === 'link')
    return (
      <a href={href} target="_blank" rel="nofollow noopener noreferrer" className={`kicker text-[0.6rem] text-or underline-offset-4 hover:underline ${className}`}>
        {isSocial ? 'Voir' : 'Acheter'} →<span className="sr-only"> (nouvel onglet)</span>
      </a>
    )
  return (
    <a href={href} target="_blank" rel="nofollow noopener noreferrer" className={`${variant === 'primary' ? 'btn-primary' : 'btn-ghost'} ${className}`}>
      {compact ? (isSocial ? 'Voir' : 'Acheter') : isSocial ? `Voir ${offer.merchantName}` : `Acheter sur ${offer.merchantName}`}
      <span aria-hidden>↗</span>
      <span className="sr-only">(nouvel onglet)</span>
    </a>
  )
}
