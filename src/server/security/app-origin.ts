/**
 * Origins this deployment answers on. Locally / in production: APP_URL.
 * On Vercel preview deployments the URL changes per deploy, so the system variables
 * VERCEL_BRANCH_URL / VERCEL_URL (set by Vercel, not by users) are accepted too.
 */
export function appUrl(): string | undefined {
  if (process.env.APP_URL) return process.env.APP_URL
  const vercel = process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL
  return vercel ? `https://${vercel}` : undefined
}

export function allowedOrigins(): string[] {
  const list = [process.env.APP_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_URL]
    .filter((v): v is string => Boolean(v))
    .map((v) => {
      try {
        return new URL(v.includes('://') ? v : `https://${v}`).origin
      } catch {
        return null
      }
    })
    .filter((v): v is string => Boolean(v))
  return [...new Set(list)]
}
