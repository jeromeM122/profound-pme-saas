# Tresser — film publicitaire « Chaque cheveu a son histoire »

Film de marque pour [routines.tresser.fr](https://routines.tresser.fr/), construit à partir de l'interface **réelle** du site
(captures Playwright), animé avec Remotion, sur une musique **originale** composée pour le projet.

## Livrables (`out/`)

Deux variantes de chaque livrable (voir « Droits » plus bas) :

| Dossier | Usage |
|---|---|
| `out/PUBLIABLE_photos-masquees/` | **Publiable tout de suite.** Les photos des membres, le hero et les tuiles du site sont remplacés à la capture par des aplats de la charte et l'icône de texture du profil. Tout le reste est l'interface réelle. |
| `out/MEMBRES_a-publier-apres-accord/` | Le site tel quel, avec les vraies photos des membres. **À ne publier qu'après accord écrit** de chaque personne visible (Andréa, Camille, Chloé, Cindy, Gabou, Jessica, Jessica C, Joanna, KJP, Lauren, Lindsay, Michoune, Naïza, Sélène, Yannick). |

Dans chaque dossier :

| Fichier | Format |
|---|---|
| `Tresser_Film_45s_9x16_*.mp4` | Film principal vertical, 1080×1920, 45 s |
| `Tresser_Film_45s_16x9_*.mp4` | Version horizontale site / YouTube, 1920×1080, 45 s |
| `Tresser_Film_15s_9x16_*.mp4` | Version courte campagnes / réseaux, 1080×1920, 15 s |
| `*_sans-musique.mp4` | Même film avec une piste audio muette (pour ajouter un son de plateforme) |
| `Tresser_Cover_9x16_TikTok-Reels_*.jpg` | Cover TikTok / Reels, 1080×1920 |
| `Tresser_Cover_4x5_Instagram_*.jpg` | Cover feed Instagram, 1080×1350 |
| `Tresser_Miniature_16x9_YouTube_*.jpg` | Miniature YouTube, 1280×720 |

Vidéo : H.264 High, CRF 16, yuv420p plage TV, BT.709, 30 i/s, `faststart`. Audio : AAC 256 kb/s, 48 kHz, −14 LUFS.

## Ce que montre le film (tout est vérifié sur le site au 23/11/2026)

| Temps | Séquence | Source |
|---|---|---|
| 0–6 s | « Chaque cheveu a son histoire. » / « Et chaque routine est différente. » — gros plans graphiques des 5 textures | Icônes de texture de la charte (`shared.js`), descriptions du guide de textures du site |
| 6–11 s | « Quels produits choisir ? » « Quelle routine adopter ? » « Qu'est-ce qui fonctionne vraiment ? » | Flacons génériques dessinés au trait, sans aucune marque |
| 11–18 s | Accueil réel, titre « Et dans leur salle de bain, on trouve quoi ? », défilement du mur ; Andréa, Chloé, Cindy, Joanna, Lindsay, Yannick mis en avant avec texture, lieu et nombre de produits réels | `home_full.png` + données JSON de la page |
| 18–26 s | Profil réel d'Andréa : Laver → Démêler → Nourrir → Coiffer → Définir, produits et commentaires réels, zoom sur son commentaire de l'étape 5 | `andrea_full.png` |
| 26–33 s | Le vrai quiz : ouverture, 3 questions (Frisés · Définition · Définir mes boucles), résultat réel affiché par le site (Andréa 100 %, Camille 75 %, Chloé 75 %) + mention « Une inspiration, pas un diagnostic. » | Interactions Playwright réelles |
| 33–39 s | Mosaïque des 15 cartes réelles du mur, puis le formulaire « Je partage ma routine » (sélection d'une texture ; **aucune donnée saisie ni envoyée**) | Captures réelles |
| 39–45 s | Logo officiel, « Chaque cheveu a son histoire. », « Trouve ta routine. Partage la tienne. », « Découvre Tresser → », routines.tresser.fr | `logo.svg` extrait du site |

Version 15 s : 0–3 s accroche · 3–6,75 s profils et textures · 6,75–11,25 s routine d'Andréa · 11,25–15 s signature.

Tout le message passe par le texte à l'écran : le film se comprend sans le son.

## Droits — à lire avant publication

- **Photos des membres** : les mentions légales du site précisent qu'elles « sont publiées avec leur accord et ne peuvent pas être réutilisées ». D'où la version `PUBLIABLE` (photos masquées). La version `MEMBRES` exige un accord écrit couvrant l'usage publicitaire (réseaux sociaux, YouTube, publicité payante).
- **Hero et tuiles éditoriales du site** (`/img/hero.jpg`, `/img/tuiles/*`) : origine non documentée (fichiers de 736 px, format typique de Pinterest). Masqués dans la version `PUBLIABLE`, visibles dans la version `MEMBRES` : à vérifier avant usage.
- **Visuels produits** (Kevin Murphy, L'Oréal Professionnel) : ils apparaissent uniquement dans l'interface, dans le contexte d'une routine réelle (usage descriptif). Aucun visuel de marque n'est utilisé hors interface.
- **Musique** : composition originale (`music/compose.py`), rendue avec la banque de sons FluidR3_GM (licence MIT). Aucun échantillon tiers.
- **Polices** : Archivo, Figtree, DM Mono (SIL Open Font License), celles du site.
- **Logo, charte, textes** : propriété de Tresser (Lauren Marianne, EI).
- **Remotion** : licence gratuite pour les entreprises de 3 personnes au plus ; au-delà, une licence entreprise est nécessaire.

Aucune image générée par IA ni aucune banque d'images n'est utilisée. Aucune personne n'est présentée comme membre si elle ne l'est pas.

## Reproduire / modifier

```bash
cd tresser-film
npm install
pip install mido && apt-get install -y fluidsynth fluid-soundfont-gm   # pour la musique
node capture/capture.mjs all        # recapture du site réel (members + masked)
python3 music/compose.py            # musique 45 s et 15 s
npx remotion studio src/index.ts    # prévisualisation et édition interactive
node render.mjs                     # rendu de tous les livrables dans out/
node render.mjs Main-916-masked     # une seule composition
```

Structure :

- `capture/` : captures Playwright du site (mobile 390×844 @3x), deux variantes
- `music/` : composition MIDI → FluidSynth → mastering ffmpeg
- `src/scenes/S1…S7` : une scène par séquence du storyboard
- `src/films/Films.tsx` : montage 45 s, 15 s, covers ; coupes calées sur le tempo (80 BPM)
- `src/lib/theme.ts` : charte (couleurs, typos, courbes d'animation)

Si le site évolue (nouveaux profils, nouveau quiz), relancer la capture puis le rendu : le film se met à jour avec l'interface réelle.

**Ajouter vos propres photos ou rushes** : les séquences 1 (textures) et 2 (salle de bain) sont des scènes indépendantes (`S1Identity.tsx`, `S2Question.tsx`). Pour les remplacer par des images tournées ou sous licence, placez les fichiers dans `public/` et utilisez `<Img>` ou `<OffthreadVideo>` de Remotion à la place des tracés.
