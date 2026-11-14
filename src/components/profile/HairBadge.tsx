import type { HairGoal, HairTexture, Porosity } from '@/generated/prisma/enums'
import { GOALS, POROSITY, TEXTURES } from '@/lib/hair/options'

/** Public hair badge, e.g. « 4C • Faible porosité • Routine Hydratation ». */
export function HairBadge({ texture, porosity, goals, size = 'md' }: { texture: HairTexture; porosity: Porosity; goals: HairGoal[]; size?: 'sm' | 'md' }) {
  const parts = [TEXTURES[texture].code, POROSITY[porosity].label, goals[0] ? GOALS[goals[0]].routine : null].filter(Boolean)
  return (
    <p className={`w-fit bg-champagne font-mono font-normal text-encre ${size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'}`}>
      {parts.join(' • ')}
    </p>
  )
}
