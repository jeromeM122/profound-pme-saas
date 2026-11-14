import { describe, expect, it } from 'vitest'
import { BudgetTier, HairGoal, HairTexture, Porosity, ScalpType } from '@/generated/prisma/enums'
import { computeDiagnostic, twinKey } from '@/lib/hair/engine'
import { BUDGET, GOALS, POROSITY, SCALP, TEXTURES } from '@/lib/hair/options'
import { quizAnswersSchema, quizSubmissionSchema, storedQuizSchema } from '@/lib/validators/quiz'

const valid = { texture: 'T3B', porosity: 'HIGH', scalp: 'DRY', goals: ['HYDRATION', 'DEFINITION'], budget: 'MID' } as const

describe('quiz options cover every DB enum value', () => {
  it.each([
    [HairTexture, TEXTURES],
    [Porosity, POROSITY],
    [ScalpType, SCALP],
    [HairGoal, GOALS],
    [BudgetTier, BUDGET],
  ])('%#', (enumObj, labels) => {
    expect(Object.keys(labels).sort()).toEqual(Object.values(enumObj).sort())
  })
})

describe('diagnostic engine', () => {
  it('builds badge and twin key', () => {
    const d = computeDiagnostic(quizAnswersSchema.parse(valid))
    expect(d.badge).toBe('3B • Haute porosité • Routine Hydratation')
    expect(d.twinKey).toBe('T3B:HIGH')
    expect(d.textureCode).toBe('3B')
    expect(twinKey('T4C', 'LOW')).toBe('T4C:LOW')
  })
})

describe('quiz validation (trust boundary)', () => {
  it('rejects unknown values, extra keys, too many or duplicate goals', () => {
    expect(quizAnswersSchema.safeParse({ ...valid, texture: 'T5A' }).success).toBe(false)
    expect(quizAnswersSchema.safeParse({ ...valid, role: 'ADMIN' }).success).toBe(false)
    expect(quizAnswersSchema.safeParse({ ...valid, goals: [] }).success).toBe(false)
    expect(quizAnswersSchema.safeParse({ ...valid, goals: ['HYDRATION', 'GROWTH', 'VOLUME', 'REPAIR'] }).success).toBe(false)
    expect(quizAnswersSchema.safeParse({ ...valid, goals: ['HYDRATION', 'HYDRATION'] }).success).toBe(false)
  })

  it('requires explicit consent', () => {
    expect(quizSubmissionSchema.safeParse(valid).success).toBe(false)
    expect(quizSubmissionSchema.safeParse({ ...valid, consent: 'true' }).success).toBe(false)
    expect(quizSubmissionSchema.safeParse({ ...valid, consent: true }).success).toBe(true)
  })

  it('validates the stored cookie payload and its version', () => {
    expect(storedQuizSchema.safeParse({ v: 1, answers: valid, consentAt: Date.now() }).success).toBe(true)
    expect(storedQuizSchema.safeParse({ v: 0, answers: valid, consentAt: Date.now() }).success).toBe(false)
  })
})
