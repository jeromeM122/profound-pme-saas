import { merchantLabel, outboundUrl, type RoutineStep } from '@/content/routines'

/** Outbound purchase link to the brand's shop (opens a new tab, no referrer leak, UTM-tagged). */
export function BuyButton({ step, slug, variant = 'primary', className = '' }: { step: RoutineStep; slug: string; variant?: 'primary' | 'ghost' | 'link'; className?: string }) {
  if (!step.buy) return null
  const href = outboundUrl(step.buy.url, slug)
  const merchant = merchantLabel(step.buy.merchant)
  const isSocial = merchant.includes('instagram')
  const text = isSocial ? 'Voir la marque' : `Acheter sur ${merchant}`
  if (variant === 'link')
    return (
      <a href={href} target="_blank" rel="nofollow noopener noreferrer" className={`kicker text-[0.6rem] text-or underline-offset-4 hover:underline ${className}`}>
        {isSocial ? 'Voir' : 'Acheter'} →
      </a>
    )
  return (
    <a href={href} target="_blank" rel="nofollow noopener noreferrer" className={`${variant === 'primary' ? 'btn-primary' : 'btn-ghost'} ${className}`}>
      {text}
      <span aria-hidden>↗</span>
      <span className="sr-only">(nouvel onglet)</span>
    </a>
  )
}
