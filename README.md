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

## Charte graphique

Appliquée d'après la *charte graphique de tresser.fr* :

- **Logo** : tracés vectoriels officiels extraits de la charte (`src/components/brand/logo-paths.ts`). Le composant `<Logo>` n'accepte que `noir` ou `blanc`, proportions verrouillées (cf. « Les interdits »). Fichiers : `public/brand/tresser-logo-{noir,blanc}.svg`.
- **Couleurs** : jaune citron `#E8F800`, bleu `#3366FF`, noir `#000000` + teintes d'applat lavande `#E4E8FF` et menthe `#E2FAE1`. Le citron n'est jamais utilisé comme couleur de texte sur blanc (contraste).
- **Typographie** : Apercu / Apercu Mono. Police commerciale (licence web requise) : en attendant, substituts libres auto-hébergés DM Sans / DM Mono. Pour basculer, déposer les `.woff2` Apercu et modifier `src/app/fonts.ts`.
- **Éléments graphiques** : boucle et vagues extraites de la charte (`<Wave name="curl|tight|wave|swell">`).
- **Univers** : thème sombre « night drive » (fond noir, accent citron, panneaux citron/bleu), titres géants en capitales qui mêlent Bold et Light italique citron, cartes arrondies à onglet, transitions courbes, bandeau défilant, révélations au scroll (respecte `prefers-reduced-motion`), accroches de la charte.

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
