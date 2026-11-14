import 'server-only'
import { cookies } from 'next/headers'
import { env } from '@/server/env'
import { signPayload, verifyPayload } from '@/server/security/crypto'
import { QUIZ_VERSION, storedQuizSchema, type QuizAnswers, type StoredQuiz } from '@/lib/validators/quiz'

const TTL = 180 * 24 * 60 * 60 // 6 months

function cookieName() {
  return env().APP_URL.startsWith('https://') ? '__Host-tresser.hd' : 'tresser.hd'
}

/**
 * Anonymous diagnostic, stored before sign-up in an HMAC-signed cookie (tamper-proof, not readable by JS).
 * SameSite=Lax so the personalised experience survives arriving from a TikTok / Instagram link.
 */
export async function writeQuizCookie(answers: QuizAnswers, consentAt = Date.now()) {
  const payload: StoredQuiz = { v: QUIZ_VERSION, answers, consentAt }
  const jar = await cookies()
  jar.set(cookieName(), signPayload(payload, env().APP_HMAC_SECRET, TTL), {
    httpOnly: true,
    secure: env().APP_URL.startsWith('https://'),
    sameSite: 'lax',
    path: '/',
    maxAge: TTL,
  })
}

export async function readQuizCookie(): Promise<StoredQuiz | null> {
  const jar = await cookies()
  const raw = verifyPayload(jar.get(cookieName())?.value, env().APP_HMAC_SECRET)
  const parsed = storedQuizSchema.safeParse(raw)
  return parsed.success ? parsed.data : null
}

export async function clearQuizCookie() {
  const jar = await cookies()
  jar.delete(cookieName())
}
