import 'server-only'
import { computeDiagnostic, type Diagnostic } from '@/lib/hair/engine'
import { QUIZ_VERSION, type StoredQuiz } from '@/lib/validators/quiz'
import { db } from '@/server/db'
import { clearQuizCookie, readQuizCookie } from './quiz-cookie'

export async function saveHairProfile(userId: string, stored: StoredQuiz) {
  const d = computeDiagnostic(stored.answers)
  const data = {
    texture: d.texture,
    porosity: d.porosity,
    scalp: d.scalp,
    goals: d.goals,
    budget: d.budget,
    twinKey: d.twinKey,
    quizVersion: QUIZ_VERSION,
    consentAt: new Date(stored.consentAt),
  }
  await db.hairProfile.upsert({ where: { userId }, create: { userId, ...data }, update: data })
}

/**
 * Called right after sign-in: attaches the anonymous quiz (signed cookie) to the account.
 * A stored profile is only overwritten by a more recent quiz.
 */
export async function linkQuizToUser(userId: string) {
  const stored = await readQuizCookie()
  if (!stored) return
  const existing = await db.hairProfile.findUnique({ where: { userId }, select: { updatedAt: true } })
  if (!existing || existing.updatedAt.getTime() < stored.consentAt) await saveHairProfile(userId, stored)
  await clearQuizCookie()
}

/** Current diagnostic: from the account if signed in, otherwise from the signed cookie. */
export async function getCurrentDiagnostic(userId?: string | null): Promise<Diagnostic | null> {
  if (userId) {
    const p = await db.hairProfile.findUnique({
      where: { userId },
      select: { texture: true, porosity: true, scalp: true, goals: true, budget: true },
    })
    if (p) return computeDiagnostic(p)
  }
  const stored = await readQuizCookie()
  return stored ? computeDiagnostic(stored.answers) : null
}

export async function deleteHairProfile(userId: string) {
  await db.hairProfile.deleteMany({ where: { userId } })
  await clearQuizCookie()
}
