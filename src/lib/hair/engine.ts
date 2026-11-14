import type { HairTexture, Porosity } from '@/generated/prisma/enums'
import type { QuizAnswers } from '@/lib/validators/quiz'
import { GOALS, POROSITY, TEXTURES } from './options'

export type Diagnostic = QuizAnswers & {
  /** "T3B:HIGH" — exact "hair twin" key */
  twinKey: string
  /** "3B • Haute porosité • Routine Hydratation" */
  badge: string
  textureCode: string
}

export function twinKey(texture: HairTexture, porosity: Porosity): string {
  return `${texture}:${porosity}`
}

/** Pure function: answers → diagnostic. No I/O, fully unit-tested. */
export function computeDiagnostic(a: QuizAnswers): Diagnostic {
  const t = TEXTURES[a.texture]
  const primaryGoal = a.goals[0]
  const parts = [t.code, POROSITY[a.porosity].label]
  if (primaryGoal) parts.push(GOALS[primaryGoal].routine)
  return { ...a, twinKey: twinKey(a.texture, a.porosity), badge: parts.join(' • '), textureCode: t.code }
}
