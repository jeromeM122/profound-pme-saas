# ReelToBuild — vidéos marketing

Sources des vidéos promotionnelles de [reeltobuild.com](https://reeltobuild.com), produites avec
[Remotion](https://www.remotion.dev) à partir de **captures de l'interface réelle** (version FR du site).

## Livrables (`out/`)

| Fichier | Format | Durée |
|---|---|---|
| `ReelToBuild_Main-9x16.mp4` | 1080 × 1920, H.264 + AAC (Reels, TikTok, Shorts) | 39 s |
| `ReelToBuild_Main-16x9.mp4` | 1920 × 1080, H.264 + AAC (site, YouTube) | 39 s |
| `ReelToBuild_Short-9x16.mp4` | 1080 × 1920, H.264 + AAC (version courte) | 15 s |
| `ReelToBuild_Cover-9x16.png` / `ReelToBuild_Cover-16x9.png` | miniatures | — |
| `ReelToBuild_US-Main-9x16.mp4` | version US, 1080 × 1920 | 39 s |
| `ReelToBuild_US-Main-16x9.mp4` | version US, 1920 × 1080 | 39 s |
| `ReelToBuild_US-Short-9x16.mp4` | version US courte, 1080 × 1920 | 15 s |
| `ReelToBuild_US-Cover-9x16.png` / `ReelToBuild_US-Cover-16x9.png` | miniatures US | — |

## Version US

Interface capturée sur `reeltobuild.com/?region=us` (anglais, unités impériales, dollars, enseignes US),
captures dans `public/ui-us/`, textes dans `src/locale.tsx`. Exemple réel « Laying 24 x 24 in porcelain
floor tile » : la règle « Floor area » passe de 377 à 240 sqft, les carreaux de 109 à 69, le thinset de
9 à 6 sacs de 50 lb, le budget estimé de ≈ $1,331 à ≈ $974. Lien de démonstration : `https://youtu.be/tilefloor24`.

| Séquence | Légende US |
|---|---|
| Problème | You found the tutorial. / But do you know what to buy? |
| Solution | Just paste the link. |
| Transformation | Your tutorial becomes a detailed shopping list. |
| Personnalisation | Scale quantities to your actual space. |
| Confiance | See where every quantity comes from. |
| Résultat | Your project is ready to go. |
| Signature | From video to project. — Try it free at reeltobuild.com |

## Storyboard (version principale)

| Temps | Séquence | Légende |
|---|---|---|
| 0–5 s | Problème : un tuto de pose de carrelage sur téléphone, questions « Combien de carreaux ? »… | Vous avez trouvé le tuto. / Mais savez-vous quoi acheter ? |
| 5–10 s | Le lien est collé dans le vrai champ, « Extraire la liste », « Analyse en cours », étapes d'analyse | Collez simplement le lien. |
| 10–17,5 s | Révélation de la liste réelle (catégories, lignes, quantités, statuts) puis zoom sur la ligne carrelage | Votre tutoriel devient une liste de courses détaillée. |
| 17,5–25 s | Règle graduée « Surface au sol » : 35 → 22 m², 112 → 71 carreaux, mortier-colle 7 → 5 sacs | Adaptez les quantités à vos dimensions réelles. |
| 25–30 s | Statuts VALIDÉ / ESTIMÉ / À CONFIRMER puis « Voir le calcul » | Comprenez d'où viennent les quantités. |
| 30–35 s | Liste finale, budget estimé, Partager / Copier / Imprimer-PDF / Exporter en CSV | Votre projet est prêt à passer à l'action. |
| 35–39 s | Logo, « De la vidéo au projet. », reeltobuild.com | — |

## Données affichées

Toutes les valeurs proviennent de l'exemple « Lot Sols — Pose de carrelage au sol 60 x 60 cm »
de la page d'accueil, capturé le jour du rendu (`public/ui/manifest.json`). Le curseur a réellement
été déplacé de 35 à 22 m² sur le site ; chaque position a été capturée (`ruler_XX.png`).
Le lien `https://youtu.be/carrelage60` est un lien de démonstration : la soumission a été
interceptée par Playwright (aucune analyse lancée, aucune requête POST envoyée au serveur) pour
filmer l'état « Analyse en cours ». Aucun site marchand n'a été visité.

La séquence 1 (tutoriel) est une illustration animée en CSS/SVG (aucune vidéo tierce). Le badge
« À CONFIRMER » provient de l'exemple « Lot Peinture » (l'exemple carrelage n'a aucune ligne à confirmer).

La musique et les bruitages sont **entièrement synthétisés** par `scripts/music.py` (aucun échantillon
externe, aucun droit tiers).

## Refaire / modifier

```bash
npm install
node scripts/capture.js fr  # recapture l'interface réelle FR (réseau vers reeltobuild.com requis)
node scripts/capture.js us  # idem, version US (public/ui-us)
python3 scripts/prep.py fr && python3 scripts/prep.py us   # repères de la règle, recadrages -> src/data-*.json
python3 scripts/music.py    # musique + bruitages (public/audio)
npx remotion studio src/index.ts   # édition visuelle
node scripts/render.js all  # 4 covers + 6 vidéos (FR et US) dans out/
node scripts/render.js videos US-Main-9x16   # une seule composition
```

- Timing des séquences, durées et bruitages : `src/timeline.json`
- Scènes : `src/scenes.tsx` ; tous les textes (FR et US) et données propres à chaque langue : `src/locale.tsx`
- Couleurs et polices (reprises du site) : `src/lib.tsx`, `src/fonts.tsx`
- Le rendu utilise le Chromium de Playwright ; changer `REMOTION_CHROME` si besoin.
