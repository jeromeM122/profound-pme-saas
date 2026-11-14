import { z } from 'zod'
import { BudgetTier, HairGoal, HairTexture, Porosity, ScalpType } from '@/generated/prisma/enums'
import { MAX_GOALS } from '@/lib/hair/options'

export const QUIZ_VERSION = 1

/** Strict schema for quiz answers — used on the client (UX) and the server (trust boundary). */
export const quizAnswersSchema = z
  .object({
    texture: z.enum(HairTexture),
    porosity: z.enum(Porosity),
    scalp: z.enum(ScalpType),
    goals: z
      .array(z.enum(HairGoal))
      .min(1, 'Choisis au moins un objectif')
      .max(MAX_GOALS, `${MAX_GOALS} objectifs maximum`)
      .refine((g) => new Set(g).size === g.length, 'Objectifs en double'),
    budget: z.enum(BudgetTier),
  })
  .strict()

export type QuizAnswers = z.infer<typeof quizAnswersSchema>

/** Explicit consent is mandatory before we store or process hair data (GDPR). */
export const quizSubmissionSchema = quizAnswersSchema.extend({ consent: z.literal(true) }).strict()

/** Payload kept in the signed cookie before sign-up. */
export const storedQuizSchema = z
  .object({ v: z.literal(QUIZ_VERSION), answers: quizAnswersSchema, consentAt: z.number().int().positive() })
  .strict()
export type StoredQuiz = z.infer<typeof storedQuizSchema>
