import type { HairGoal, HairTexture, Porosity } from '@/generated/prisma/enums'
import { GOALS, POROSITY, TEXTURES } from '@/lib/hair/options'

/** Public hair badge, e.g. « 4C · Faible porosité · Routine Hydratation ». */
export function HairBadge({ texture, porosity, goals, size = 'md' }: { texture: HairTexture; porosity: Porosity; goals: HairGoal[]; size?: 'sm' | 'md' }) {
  const parts = [TEXTURES[texture].code, POROSITY[porosity].label, goals[0] ? GOALS[goals[0]].routine : null].filter(Boolean)
  return (
    <p className={`w-fit border border-current uppercase tracking-[0.14em] ${size === 'sm' ? 'px-2 py-1 text-[0.56rem]' : 'px-3 py-1.5 text-[0.64rem]'}`}>
      {parts.join(' · ')}
    </p>
  )
}
