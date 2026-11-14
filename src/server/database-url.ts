/**
 * Database URL resolution. Vercel integrations (Neon, Vercel Postgres) may expose the connection
 * string under different names, possibly with a custom prefix.
 */
export function databaseUrl(): string | undefined {
  const env = process.env
  const direct = env.DATABASE_URL || env.POSTGRES_PRISMA_URL || env.POSTGRES_URL
  if (direct) return direct
  const key = Object.keys(env).find((k) => /_(DATABASE_URL|POSTGRES_PRISMA_URL|POSTGRES_URL)$/.test(k) && env[k])
  return key ? env[key] : undefined
}

export function redisCredentials(): { url?: string; token?: string } {
  const env = process.env
  const pick = (names: string[], re: RegExp) =>
    names.map((n) => env[n]).find(Boolean) ?? env[Object.keys(env).find((k) => re.test(k) && env[k]) ?? '']
  return {
    url: pick(['UPSTASH_REDIS_REST_URL', 'KV_REST_API_URL'], /_(UPSTASH_REDIS_REST_URL|KV_REST_API_URL)$/),
    token: pick(['UPSTASH_REDIS_REST_TOKEN', 'KV_REST_API_TOKEN'], /_(UPSTASH_REDIS_REST_TOKEN|KV_REST_API_TOKEN)$/),
  }
}
