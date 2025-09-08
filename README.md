
# VisiIA — Profound pour PME/TPE (MVP)

Stack: Next.js (pages router) + APIs mock. Déployable sur **Vercel** en 2 minutes.

## Lancer en local
```bash
npm i
npm run dev
```

## Déployer sur Vercel
1. Créez un repo GitHub et poussez ce dossier.
2. Sur vercel.com, "New Project" → importez le repo.
3. Build command: `next build` (défaut). Output: `.next`.
4. Variables d'env (plus tard pour vraies intégrations).

## TODO Intégrations (prod)
- **Stripe**: remplacez les liens placeholder sur /pricing par vos Checkout Links.
- **PDF**: utilisez `@react-pdf/renderer` ou Puppeteer (fonction Edge) pour un vrai PDF.
- **Réseaux sociaux**: branchez APIs officielles (Meta Graph, LinkedIn, Google Business).
- **Visibilité IA**: interrogez des Answer Engines via leurs APIs/SDKs (ou scraping légal).
- **Auth**: NextAuth si besoin d'accès privé.
- **Affiliation**: Rewardful/FirstPromoter (liens ref + webhooks Stripe).
```

