import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'tsx prisma/seed.ts' },
  // Migrations need a direct (non-pooled) connection; Neon on Vercel exposes it as DATABASE_URL_UNPOOLED.
  datasource: { url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || '' },
})
