// Build script used by Vercel ("vercel-build"). Checks configuration first and explains,
// in plain French, what is missing — then runs prisma generate, migrations and next build.
import { spawnSync } from 'node:child_process'

const env = process.env
const first = (...names) => names.map((n) => env[n]).find((v) => v && v.trim())
const firstMatching = (re) => Object.keys(env).filter((k) => re.test(k)).map((k) => env[k]).find((v) => v && v.trim())

// Database: Neon / Vercel Postgres expose different names depending on the integration and prefix.
const pooled = first('DATABASE_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL') ?? firstMatching(/_(DATABASE_URL|POSTGRES_PRISMA_URL|POSTGRES_URL)$/)
const direct = first('DATABASE_URL_UNPOOLED', 'POSTGRES_URL_NON_POOLING') ?? firstMatching(/_(DATABASE_URL_UNPOOLED|POSTGRES_URL_NON_POOLING)$/)
const redisUrl = first('UPSTASH_REDIS_REST_URL', 'KV_REST_API_URL') ?? firstMatching(/_(UPSTASH_REDIS_REST_URL|KV_REST_API_URL)$/)
const redisToken = first('UPSTASH_REDIS_REST_TOKEN', 'KV_REST_API_TOKEN') ?? firstMatching(/_(UPSTASH_REDIS_REST_TOKEN|KV_REST_API_TOKEN)$/)

// On a private preview (behind Vercel Authentication), Redis and e-mail are optional:
// rate limiting falls back to memory and sign-in is simply unavailable without e-mail.
const isPreview = env.VERCEL_ENV === 'preview'

const checks = [
  ['Base de données (Neon)', Boolean(pooled), 'Storage → Create Database → Neon → Connect, en cochant « Preview ».', true],
  ['AUTH_SECRET', (env.AUTH_SECRET ?? '').length >= 32, 'Settings → Environment Variables : 32 caractères minimum.', true],
  ['APP_HMAC_SECRET', (env.APP_HMAC_SECRET ?? '').length >= 32, 'Settings → Environment Variables : 32 caractères minimum, différent de AUTH_SECRET.', true],
  ['Redis (Upstash)', Boolean(redisUrl && redisToken), 'Storage → Upstash (Redis) → Connect.', !isPreview],
  ['E-mails de connexion (EMAIL_SERVER + EMAIL_FROM)', Boolean(env.EMAIL_SERVER && env.EMAIL_FROM), 'Resend : EMAIL_SERVER=smtps://resend:re_TACLE@smtp.resend.com:465 et EMAIL_FROM=Tresser <onboarding@resend.dev>', !isPreview],
]

console.log(`\n=== Vérification de la configuration tresser.fr (${isPreview ? 'prévisualisation privée' : env.VERCEL_ENV ?? 'local'}) ===`)
for (const [name, ok, help, required] of checks) {
  const icon = ok ? '✅' : required ? '❌' : '⚠️ '
  const note = ok ? '' : required ? `\n     → ${help}` : `  (optionnel en prévisualisation)\n     → ${help}`
  console.log(`${icon} ${name}${note}`)
}
const missing = checks.filter(([, ok, , required]) => !ok && required)
if (missing.length) {
  console.log(`\n${missing.length} réglage(s) manquant(s). Ajoute-les, puis Deployments → ⋯ → Redeploy.`)
  console.log('(Les variables doivent être cochées pour l’environnement « Preview ».)\n')
  process.exit(1)
}
console.log('Configuration OK.\n')

const childEnv = { ...env, DATABASE_URL: pooled, DATABASE_URL_UNPOOLED: direct ?? pooled, UPSTASH_REDIS_REST_URL: redisUrl, UPSTASH_REDIS_REST_TOKEN: redisToken }
const run = (label, cmd, args) => {
  console.log(`\n=== ${label} ===`)
  const r = spawnSync(cmd, args, { stdio: 'inherit', env: childEnv })
  if (r.status !== 0) {
    console.log(`\n❌ Échec à l’étape « ${label} ». L’erreur exacte est juste au-dessus.`)
    process.exit(r.status ?? 1)
  }
}
run('Génération du client Prisma', 'npx', ['prisma', 'generate'])
run('Migrations de la base', 'npx', ['prisma', 'migrate', 'deploy'])
run('Synchronisation du catalogue', 'npx', ['tsx', 'prisma/seed-catalog.ts'])
run('Build Next.js', 'npx', ['next', 'build'])
