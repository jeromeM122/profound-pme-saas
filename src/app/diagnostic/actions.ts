'use server'

import { headers } from 'next/headers'
import { QUIZ_VERSION, quizSubmissionSchema } from '@/lib/validators/quiz'
import { auth } from '@/server/auth'
import { env } from '@/server/env'
import { saveHairProfile } from '@/server/hair/profile'
import { writeQuizCookie } from '@/server/hair/quiz-cookie'
import { hashIp } from '@/server/security/crypto'
import { clientIp, limiter } from '@/server/security/ratelimit'

export type QuizResult = { ok: true } | { ok: false; error: string }

export async function submitQuiz(input: unknown): Promise<QuizResult> {
  const parsed = quizSubmissionSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Certaines réponses sont invalides. Vérifie chaque étape.' }

  const ip = hashIp(clientIp(await headers()), env().APP_HMAC_SECRET)
  if (!(await limiter().limit('quiz', ip)).success) return { ok: false, error: 'Trop de tentatives, réessaie dans une minute.' }

  const { texture, porosity, scalp, goals, budget } = parsed.data
  const answers = { texture, porosity, scalp, goals, budget }
  const stored = { v: QUIZ_VERSION, answers, consentAt: Date.now() } as const
  const session = await auth()
  if (session?.user?.id) await saveHairProfile(session.user.id, stored)
  else await writeQuizCookie(answers, stored.consentAt)
  return { ok: true }
}
