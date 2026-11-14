# Tresser — Hair-Social Commerce

Le « Facebook du cheveu » : diagnostic capillaire, communauté, vidéos sociales et commerce hybride (vente directe + affiliation).

**Stack :** Next.js 16 (App Router) · TypeScript strict · Tailwind v4 · Prisma 7 / PostgreSQL · Auth.js v5 · Zod · Upstash Redis · Vitest

## Démarrer en local

```bash
cp .env.example .env          # puis remplir AUTH_SECRET, APP_HMAC_SECRET, DATABASE_URL…
npm install
npm run db:migrate            # applique les migrations
SEED_ADMIN_EMAIL=toi@exemple.fr npm run db:seed   # crée le premier ADMIN
npm run dev
```

Scripts : `lint`, `typecheck`, `test`, `build`.

## Sécurité (socle)

| Mesure | Où |
|---|---|
| CSP par requête (nonce + `strict-dynamic`), iframes limitées à TikTok / Instagram / YouTube-nocookie | `src/proxy.ts`, `src/server/security/csp.ts` |
| HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP | `next.config.ts` |
| CSRF : vérification stricte de l'`Origin` sur toute requête mutante (+ CSRF Auth.js) | `src/server/security/origin.ts` |
| Rate limiting (Upstash en prod, obligatoire) : auth, magic link (par IP **et** par e-mail), quiz, `/go/*`, API | `src/server/security/ratelimit.ts` |
| Sessions en base (révocables), cookie `__Host-` HttpOnly · Secure · SameSite=Lax | `src/server/auth.ts` |
| Aucun token OAuth stocké (identité uniquement) | `hardenedAdapter()` |
| RBAC `USER < CREATOR < MODERATOR < ADMIN`, vérifié dans chaque page/action (jamais seulement dans le proxy) | `src/server/rbac.ts`, `src/server/guards.ts` |
| Validation Zod (e-mail, pseudo, callbackUrl anti open-redirect) | `src/lib/validators` |
| Requêtes 100 % paramétrées (`$queryRawUnsafe` interdit par ESLint) + contraintes `CHECK` en base | `eslint.config.mjs`, `prisma/migrations` |
| IP jamais stockées en clair (HMAC) | `src/server/security/crypto.ts` |
| Variables d'environnement validées au démarrage (refus si http ou sans Redis en prod) | `src/server/env.ts` |

Pourquoi `SameSite=Lax` et pas `Strict` : une visiteuse arrivant depuis un lien TikTok/Instagram apparaîtrait déconnectée, et Apple Sign-In renvoie un POST cross-site. Le CSRF est bloqué par la vérification d'`Origin`.

## Feuille de route

1. ✅ Socle, sécurité & authentification
2. Quiz « Hair Diagnostic Engine » & profil social
3. Catalogue hybride e-commerce / affiliation (`/go/[offerId]`, Stripe)
4. Vidéos sociales (façades, modération, filtres par texture)
