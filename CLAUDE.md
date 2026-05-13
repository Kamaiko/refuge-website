# CLAUDE.md — Refuges Charlevoix

> Ce fichier permet la reprise de contexte si la conversation crashe. À jour au scaffold initial.

## Concept

Site portfolio Awwwards-level. **Marque fictive** d'hébergements premium en Charlevoix (Québec), inspirée du *format structurel* de capsules.moyra.co (lui-même un projet concept du studio Moyra).

**Public cible** : visiteurs Awwwards/recruteurs front-end, plus opérateurs touristiques québécois pour valorisation post-portfolio.

**Tonalité de marque** : poétique, contemplative, sobre. Texte court, lyrique, évocateur (FR seulement).

**Nom de marque définitif** : Aquilon (vent du nord en latin/littéraire). Voir la section « Note sur le nom de marque » plus bas pour le contexte et la procédure de rename.

## Règles IP — strictes

✅ **On extrait/réutilise** (technique, factuel, neutre du point de vue créatif) :
- Format structurel (types de sections, ordre, rythme de scroll) — convention de genre
- Patterns techniques (GSAP timelines, Lenis smooth scroll, scroll-driven)
- Noms de fonts (Host Grotesk = libre)
- Hex codes des couleurs observées (#181717, #F4EFE7)
- Tailles, spacings, durées d'animation

❌ **On ne reproduit PAS** :
- Code source de Capsules
- Copy/texte de la marque (manifesto, descriptions, taglines) — même avec modifications mineures
- Photos/vidéos (on génère nos propres assets AI)
- Nom "Capsules", logo, identité graphique
- Aucune "modification mineure" de leur contenu copyrighté

**Tout le contenu de notre site (copy, imagerie, identité) est original.**

## Stack

- **Next.js** 16.2.4 (App Router)
- **React** 19.2.4
- **TypeScript** 5
- **Tailwind CSS** 4.2.4 (avec @theme directive)
- **GSAP** 3.15.0 + @gsap/react 2.1.2
- **Lenis** 1.3.23 (smooth scroll)
- **Zod** 4.4.1 (validation forms)
- **clsx** + **tailwind-merge** (utilitaires class)

## Décisions verrouillées

| Décision | Choix |
|---|---|
| Stack | Next.js 16 + GSAP + TS + Tailwind v4 + Lenis |
| Région | Charlevoix (fjord, fleuve, montagnes) |
| Saison dominante | Été + automne |
| Nombre d'unités | 3 |
| Architecture | Test 3 formes en Phase 2 (capsule, cube, A-frame) |
| Matériau dominant | Bois carbonisé noir (Shou Sugi Ban) |
| Tonalité | Poétique / contemplative |
| Langue | Français seulement |
| Manifeste | Gardé (scroll-driven typography) |
| Hero | Vidéo loop AI 8-10s |
| Sections optionnelles | Toutes gardées |
| Réservation | Form contact Server Action |
| Palette | Sunset + turquoise + boréal (UI minimale dark/cream + photos riches) |
| Port dev | 3001 |
| Nom dossier | refuges-charlevoix |

## Inspection technique de capsules.moyra.co (référence)

Réalisée via Playwright le 2026-04-30. Findings techniques uniquement :

### Stack observé
- Nuxt.js (vu dans `_nuxt/` URLs)
- Tailwind v4 avec custom @-prefix container queries (ex: `@p-[10]`, `@mb-[120]`)
- Pas de scripts GSAP/Lenis externes — bundlés dans Nuxt build chunks

### Typographie
- **Font unique** : Host Grotesk (poids 400/500/600/700/800) — libre sur Fontshare et Google Fonts ✅
- Pas de h1/h2/h3 sémantiques (divs stylés à la place — à reconsidérer pour notre version, pour SEO/a11y)

### Couleurs UI
- Background : `#181717` (presque noir)
- Texte : `#F4EFE7` (crème chaud)
- **Insight clé** : palette UI ultra-minimale ; la **photographie** apporte toute la couleur. Pour nous → garder UI sobre, mettre la richesse dans les images AI Charlevoix.

### Structure
- 9 sections, ~18,618px de scroll total
- 27 images, 7 vidéos, 0 canvas
- 18 boutons (CTA persistants : Reserve top-right, Menu bottom-center, badge latéral)

### Patterns techniques observés (à réimplémenter avec contenu original)
- Hero full-viewport (h-svh) avec architecture en photo + wordmark massif
- Section unit showcase scroll-pinned avec image en rounded card centrée
- Background wordmark parallax (s'étire derrière l'image au scroll)
- Manifesto avec scroll-driven typography (texte qui passe de transparent à opaque mot par mot)
- Activity grid horizontal scroll avec rounded card images + métadonnées (difficulté, durée)
- Persistent floating menu CTA bottom-center

## Palette tokens (globals.css)

```css
--color-base-noir: #181717        /* fond principal */
--color-base-noir-soft: #1F1E1E   /* surfaces secondaires */
--color-creme: #F4EFE7            /* texte principal */
--color-creme-dim: #C9C5BD        /* texte secondaire */

--color-vert-sapin: #2D5F4E       /* accent forêt */
--color-vert-sapin-deep: #1F4338  /* accent forêt sombre */

--color-turquoise: #4FB8B0        /* accent eau */
--color-turquoise-deep: #2C8A82   /* accent eau profonde */

--color-orange-sunset: #C2410C    /* accent sunset */
--color-or-ambre: #D97706         /* accent doré */

--color-creme-terre: #E8DCC4      /* surfaces secondaires chaud */
```

## Pipeline d'assets AI

### Modèles
- **Images statiques** : Nano Banana / Gemini Image (image-to-image avec frame init pour cohérence)
- **Vidéos courtes** : Seedance 2.0 ou Kling 3.0 (5-10s)

### Workflow
1. Générer 3-4 propositions d'architecture (capsule cylindrique, cube, A-frame)
2. Sélectionner forme gagnante → devient frame init
3. Image-to-image avec frame init pour toutes générations subséquentes
4. Validation manuelle, regénération si incohérent
5. AVIF (Sharp/squoosh) avant intégration
6. Vidéos en MP4 H.265 + WebM VP9 fallback

### Liste d'assets à générer (~30 images + 10 vidéos)

**Images (Nano Banana)** :
- 3 unités × 3 angles (extérieur jour, extérieur crépuscule, intérieur) = 9
- Paysages Charlevoix (fjord, forêt, fleuve, sommet, lac) = 5
- Activités (kayak, hike, sauna, observation, gastronomie) = 5
- Détails (bois carbonisé, brume, feuilles, eau, foyer) = 5
- Hero / pleine page = 3
- Réserve / variations = 3

**Vidéos (Seedance/Kling)** :
- 1 hero loop (architecture + brume)
- 3 transitions de section
- 4 activités courtes
- 2 ambiances

### Prompts de test architecture (Nano Banana)

**Style commun (suffixe)** :
```
Setting: Charlevoix, Quebec boreal forest in early autumn, soft morning fog rising from the ground, golden birch and red maple trees, distant view of the St. Lawrence fjord. Architectural photography style, golden hour, soft cinematic lighting, ultra-realistic, hyper-detailed, 35mm lens, shallow depth of field. Single building only, isolated in landscape, no people. Aspect ratio 16:9.
```

**A — Capsule cylindrique** :
```
Modern minimalist architecture: a single sleek horizontal cylindrical capsule cabin, matte charcoal black exterior (Shou Sugi Ban), one large round panoramic window on the front end, supported by minimal black steel feet, [+ style commun]
```

**B — Cube noir** :
```
Modern minimalist architecture: a single perfect cube cabin, charred black timber exterior (Shou Sugi Ban), full-facade floor-to-ceiling glass on one side revealing minimalist interior, flat roof, raised on minimal black steel stilts above forest floor, [+ style commun]
```

**C — A-frame** :
```
Modern minimalist architecture: a single A-frame triangular cabin with steeply pitched roof reaching nearly to the ground, charred black timber exterior (Shou Sugi Ban), massive triangular floor-to-ceiling glass facade, small terrace deck in front, [+ style commun]
```

## Structure du site (sections)

1. **Hero** — Vidéo loop AI background, wordmark + tagline, indicateur scroll
2. **Manifeste** — Scroll-driven typography (reveal mot par mot)
3. **Le lieu (Charlevoix)** — Présentation région, parallax sur paysages
4. **Concept architectural** — Philosophie design, matériaux
5. **Les 3 unités** — Section dédiée par unité
6. **Expériences / Activités** — 4-6 activités outdoor
7. **Galerie / Ambiance** — Mood board pur visuel
8. **Journal / Écrits courts** — 2-3 textes saisonniers
9. **FAQ pratique** — Q/R utilitaires
10. **Réservation / Contact** — Server Action Next.js
11. **Footer** — Nav, social, mention "Concept fictif"

## Plan d'implémentation par phase

### Phase 1 — Scaffold (✅ fait)
- Inspection Capsules + scaffold Next.js + setup tokens + CLAUDE.md

### Phase 2 — Assets AI (à faire par Patrick)
- Test 3 architectures, sélection
- Génération de tous les assets (~30 images + 10 vidéos)
- Optimisation AVIF/WebM
- Placement dans `public/images/` et `public/videos/`

### Phase 3 — Sections statiques (en cours)
- Composants par section avec copy original FR poétique
- Layouts responsive
- Placeholders pour assets AI

### Phase 4 — Animations GSAP
- ScrollTrigger reveal, parallax, scroll-driven typography
- Hero video loop
- Hover states, transitions
- Lenis smooth scroll global
- Reduced-motion fallbacks

### Phase 5 — Polish & SEO
- Responsive mobile (375/768/1024/1440)
- Lighthouse desktop ≥ 95, mobile ≥ 80
- SEO metadata, OG, structured data
- Accessibility audit
- Case study README final

## État actuel (mai 2026)

✅ **Phase 1 — Scaffold** complète :
- Next.js 16.2.4 + React 19.2.4 + Tailwind 4.2.4 + GSAP 3.15 + Lenis 1.3.23
- Inspection technique de capsules.moyra.co complète (font Host Grotesk, palette #181717/#F4EFE7, structure des animations)
- Tokens design + folder structure
- Dev server tourne sur http://localhost:3001

✅ **Phase 3 — Sections + Animations** complète :
**Sections actuelles** (11) : `Hero → Manifeste → Medaillons → Choisir → Hebergements → MarqueeBrand → Pourquoi → Activites → Carousel → Feedback → Cta → Footer` (Cta + Footer partagent un wrapper `relative isolate` avec un BgGradient base-noir→gris-tan).
- Header : Reserve top-right (simple fade-in, scroll-out direction-based) + Menu bottom-center (cream pill grows around inner gris-tan circle, iOS wheel Menu↔Close)
- MenuOverlay (clip-path **inset arrondi** expand depuis bouton — pas de cercles)
- ReservePanel (slide-in from right, OKLAB transitions via `<BgGradient>`)
- CustomCursor (point + cercle, mix-blend-difference, hover scale)
- Form Réservation avec Server Action + Zod
- **Composants common/ actuels** :
  - `SmoothScroll` (Lenis + GSAP sync, panel-aware lock)
  - `MenuContext` + `MenuOverlay`, `ReservePanelContext` + `ReservePanel`
  - `RevealText` (2 modes : lines, words)
  - `RevealChars` (per-char slide right→left, word-aware splitting) — utilisé par Hebergements, Pourquoi, Footer
  - `CurtainReveal` (sharp horizontal cut, dual-clipped layers, anti-fringe)
  - `Marquee` (directional scroll-aware wordmark loop, optionnel `pauseOnHover` avec hit-test scroll + curseur)
  - `BrandMark` (wordmark + ® subscript — **non utilisé actuellement** ; le Footer utilise un mécanisme `:last-child` CSS scoped par `.aquilon-wordmark-fill`)
  - `BgGradient` (linear gradient overlay OKLAB)
  - `SlideIndicators` (chips 01/03 paginés, prop `tone: "muted" | "strong"`)
  - `NavWheelLink` (iOS-wheel hover flip pour les nav links du Cta)
  - `CustomCursor`

⏳ **Phase 2 — Assets AI** (à faire par Patrick) :

- [ ] Générer 3-4 propositions d'architecture (capsule, cube, A-frame) via Nano Banana — prompts dans le catalogue ci-dessus
- [ ] Sélectionner la forme finale → cette image devient frame init pour image-to-image
- [ ] Générer les ~30 images (3 unités × 3 angles + paysages + activités + détails + variations)
- [ ] Générer les ~10 vidéos courtes (Seedance/Kling, prompts dans le catalogue)
- [ ] Optimiser : images en AVIF (Sharp ou squoosh), vidéos en MP4 H.265 + WebM VP9
- [ ] Placer dans `public/images/` et `public/videos/` selon les paths déjà référencés dans le code
- [ ] Mettre à jour `lib/data/unites.ts`, `lib/data/activites.ts` avec les bons paths

⏳ **Phase 4 — Polish** (post-assets) :

- [x] Décision finale du **nom de marque** : Aquilon (vent du nord en latin/littéraire)
- [ ] Wordmark / logo SVG (à dessiner ou générer)
- [ ] Raffinage du copy après validation des visuels
- [ ] Detail panel par unité (overlay click-to-open avec galerie)
- [ ] Hover states sur les cards (image scale subtil)
- [ ] Parallax léger sur les paysages
- [ ] Page transition overlay (fade noir entre navigations)
- [ ] Responsive mobile fine-tuning (375 / 768 / 1024 / 1440)
- [ ] SEO complet : metadata, OG image, structured data LodgingBusiness
- [ ] Lighthouse audit (cible : desktop ≥ 95, mobile ≥ 80)
- [ ] Case study README avec breakdown technique

## Note sur le nom de marque

**Aquilon** — vent du nord en latin/littéraire (de l'antiquité romaine). Choisi pour son registre érudit, sa rareté en hospitalité, et l'écho avec le contexte maritime nordique du St-Laurent. À noter : l'un des trois refuges s'appelle quand même "Brume" (slug `brume` dans `lib/data/unites.ts`) — c'est intentionnel, le mot reste utilisé comme nom de produit, pas comme nom de marque.

**Pour renommer** : éditer `SITE_CONFIG.name` et `SITE_CONFIG.brandMark` dans `lib/constants.ts`. Les chaînes affichées (eyebrow, marquee, manifeste, feedback) sont actuellement hardcoded — chercher littéralement "Aquilon" pour les retrouver.

## Verification locale (Wave 1+2 testées)

Screenshots pris via Playwright à :
- `/refuges-hero.jpeg` — hero wordmark + tagline + CTAs
- `/refuges-manifeste.jpeg` — manifeste scroll-text-reveal
- `/refuges-lieu.jpeg` — Charlevoix split layout
- `/refuges-concept.jpeg` — 3 principes en grille + transition vers MarqueeBrand
- `/refuges-unite-1.jpeg` — Aubépine + Galets en alternance
- `/refuges-activites.jpeg` — horizontal scroll-pinned 6 cards
- `/refuges-galerie.jpeg` — grid asymétrique
- `/refuges-reservation.jpeg` — form complet
- `/refuges-footer.jpeg` — footer

Console clean — seuls 404 attendus sur `/videos/hero-loop.mp4` (résolu : tag `<source>` commenté en attendant la génération en Phase 2).

## Inventaire technique des animations à implémenter

(Identifié via inspection Playwright de capsules.moyra.co — ce sont des techniques GSAP / CSS standards, pas un blueprint propriétaire.)

### A — Infrastructure
1. ✅ Lenis smooth scroll (`html.lenis`) synchronisé avec ScrollTrigger
2. ✅ GSAP + ScrollTrigger
3. ✅ Custom cursor (point + cercle, mix-blend-difference, scale au hover)

### B — Reveals texte
- `<RevealText mode="lines | words">` — primitive 2-modes (entrance one-shot)
- `<RevealChars play>` — per-char slide right→left inside per-glyph mask, word-aware splitting (no mid-word breaks). Imperative play prop. Used in Capsules.
- `<CurtainReveal>` — sharp horizontal cut, complementary clip-path on cream + filter layers (eliminates antialiasing fringe). Used in Manifeste.

### C — Backgrounds & transitions
- `<BgGradient from to direction noiseOpacity>` — static linear gradient overlay, OKLAB-interpolated via inline `linear-gradient(in oklab, ...)` (Tailwind v4 default OKLAB doesn't apply to var()-backed stops at runtime). SVG turbulence noise dither.

### D — Marquee
- `<Marquee text speed directional>` — directional flag toggles scroll-direction-aware reverse

### E — Floating UI
- Header CTA `Réserver` (top-right, simple fade-in, scroll-direction-driven hide/show with 0.35s anti-jitter delay)
- Menu CTA (bottom-center, cream pill unrolls around gris-tan circle on entry)
- Side badge vertical (`Concept · 2026`)

### F — Overlays
- Menu fullscreen overlay (clip-path **inset rounded rectangle** expand from button position — not a circle anymore)
- Reservation form Server Action (Zod validation, no email delivery yet — TODO Resend)

### G — Bonus
- `useReducedMotion` hook + CSS fallback for prefers-reduced-motion

## Prompts Nano Banana — catalogue d'assets à générer

**Style commun (suffixe à ajouter à TOUS les prompts pour cohérence)** :
```
Setting: Charlevoix, Quebec, autumn boreal forest with golden birch and red maple,
distant view of the St. Lawrence fjord with turquoise water glints. Cinematic golden-hour
lighting, soft morning fog, ultra-realistic, hyper-detailed, 35mm lens, shallow depth of
field, no people, no signage, no logos. Color palette: deep forest green, charred black wood,
turquoise water, sunset orange, cream sky. Aspect ratio 16:9.
```

### Phase 2A — Test 3 architectures (génère 3-4 variantes par prompt, choisis la meilleure)

**A1 — Capsule cylindrique** :
```
Modern minimalist architecture: a single sleek horizontal cylindrical capsule cabin,
matte charred-black timber exterior (Shou Sugi Ban), one large round panoramic window
on the front showing warm interior lights, supported on minimal black steel feet,
nestled in the boreal forest, [+ style commun]
```

**A2 — Cube noir** :
```
Modern minimalist architecture: a single perfect cube cabin, charred black timber
exterior (Shou Sugi Ban), full-facade floor-to-ceiling glass on one side revealing
a minimalist warm interior, flat roof, raised on minimal black steel stilts above
the forest floor, [+ style commun]
```

**A3 — A-frame** :
```
Modern minimalist architecture: a single A-frame triangular cabin with a steeply
pitched roof reaching nearly to the ground, charred black timber exterior, massive
triangular floor-to-ceiling glass facade with warm interior glow, small wooden
terrace deck in front, [+ style commun]
```

### Phase 2B — Hero loop video (Seedance 2.0 / Kling 3.0, 8s, loop-perfect)

**Prompt principal (recommandé — loop propre via ambient-only motion)** :

```
Cinematic locked-off shot, completely static camera, no pan, no zoom, no shake.
Subject: a single charred-black timber [SHAPE] cabin, dead center of frame, raised
slightly above the forest floor on minimal black steel feet. Setting: Charlevoix
boreal forest in early autumn, surrounded by tall golden birches and red maples,
moss-covered ground, soft morning fog drifting horizontally from left to right at
slow speed (covering about 6 percent of the frame per second). Distant view of
turquoise St. Lawrence fjord visible between trees on the right. Warm amber interior
light pulsing very gently through the cabin window (subtle 4-second pulse cycle).
One single golden birch leaf falling slowly diagonally through frame from upper-right
to lower-left, completing its fall at 6 seconds. Trees in background swaying very
subtly in light wind. Foreground rocks and ground completely still. Golden hour
lighting, color palette deep forest green, charred black, turquoise water, sunset
orange, cream sky.

LOOP REQUIREMENTS: ensure perfect seamless loop. Last frame must match first frame
in: fog density and position pattern, light intensity, tree sway position, leaf
position (the falling leaf must complete its arc and exit the frame before frame
7.5, so frames 7.5–8 show only ambient motion identical to frame 0).

Duration: 8 seconds. Frame rate: 24fps. Resolution: 1920x1080. Aspect ratio: 16:9.
No people, no text, no logos, no birds, no animals. Ultra-realistic, hyper-detailed,
35mm lens, shallow depth of field, soft cinematic grade.
```

**Pourquoi ce prompt loop proprement** :
- Caméra 100% statique → aucune désync de cadrage
- Brume linéaire à vitesse constante → identique à chaque frame du cycle
- Pulse lumière intérieure 4s → exactement 2 cycles complets en 8s
- Feuille termine avant 7.5s → 0.5s d'ambiance pure pour rejoindre le loop
- Sol/rochers statiques → zéro mismatch

**Image hero (`public/images/hero-shape.avif`, sert de poster + dérivé)** :
Soit extraire un frame de la vidéo générée (`ffmpeg -i hero-loop.mp4 -ss 4 -frames:v 1 hero-shape.jpg`), soit regénérer une image statique avec le prompt Phase 2A correspondant (pour cohérence cadrage avec la vidéo loop).

**Encodage final** :
```
ffmpeg -i output.mp4 -c:v libx265 -crf 24 -pix_fmt yuv420p hero-loop.mp4
```

### Phase 2C — Les 3 unités (image-to-image avec frame init de l'architecture choisie)

**Aubépine** (au creux de la forêt) :
```
Same [SHAPE] cabin from frame init, this version named "Aubépine": deep inside dense
boreal forest, surrounded by tall white birches and red maples, soft morning fog,
small outdoor wooden sauna with a chimney smoking gently nearby, no view of water.
Twilight blue hour, warm interior glow. [+ style commun]
```

**Galets** (au bord du fleuve) :
```
Same [SHAPE] cabin from frame init, this version named "Galets": positioned 10 meters
from a rocky St. Lawrence shoreline, low tide exposing pebble flats, an outdoor wooden
hot tub on the deck facing the river, distant white belugas surfacing in the water.
Late afternoon golden light. [+ style commun]
```

**Brume** (sur le promontoire) :
```
Same [SHAPE] cabin from frame init, this version named "Brume": perched on a rocky
cliff promontory overlooking 40 km of St. Lawrence fjord, fog rising from the water
below the cabin, panoramic terrace with an outdoor stone fire pit, dramatic horizon.
Sunrise pastel sky. [+ style commun]
```

### Phase 2D — Intérieurs (3 variantes)

```
Architectural interior of a [SHAPE] cabin: minimalist Scandinavian design, warm wood
walls, queen bed with linen sheets, large window framing the boreal forest outside,
soft morning light, cast iron wood stove glowing in corner, woven rug, no clutter,
no humans visible. Editorial interior photography, 50mm lens. [+ style commun]
```

### Phase 2E — Paysages Charlevoix (5 plans)

1. **Fjord** : `Wide aerial view of the St. Lawrence fjord at sunrise, turquoise water, mist hovering, dark mountain silhouettes, golden sky. [+ style commun]`
2. **Forêt boréale** : `Deep autumn boreal forest path, towering golden birches and crimson maples, soft fog filtering through trees, wet mossy ground. [+ style commun]`
3. **Galets de plage** : `Rocky St. Lawrence shoreline at low tide, smooth gray pebbles, distant cargo ship on horizon, soft cloudy light. [+ style commun]`
4. **Sommet panoramique** : `Mountain summit overlooking Charlevoix valley, autumn forest spread below, distant fjord glimmer, dramatic clouds. [+ style commun]`
5. **Lac brumeux** : `Quiet boreal lake at dawn, perfect mirror reflection of autumn forest, fog rising from water surface, no ripples, no people. [+ style commun]`

### Phase 2F — Activités (5 plans)

1. **Kayak fjord** : `Single sea kayak on calm turquoise fjord water at golden hour, distant cliff, paddle dipping, wake behind. From slightly above. No face visible. [+ style commun]`
2. **Marche forêt** : `First-person low POV through fall boreal forest path, golden leaves on ground, soft fog, sunbeams. No people. [+ style commun]`
3. **Sauna nordique** : `Wooden Scandinavian sauna in forest at twilight, steam rising from chimney, warm light through small window, snow on roof or autumn leaves around. [+ style commun]`
4. **Observation baleines** : `Beluga whale tail breaking the turquoise surface of the St. Lawrence, distant view, sunset light, painterly. [+ style commun]`
5. **Foyer extérieur** : `Outdoor stone fire pit at dusk on a wooden deck, glowing flames, two empty chairs, fog in the forest beyond. [+ style commun]`

### Phase 2G — Détails / textures (5)

1. `Macro detail of charred black Shou Sugi Ban wood texture, deep grain, soft shadows. [+ style commun]`
2. `Drops of rain on a metal-frame window with autumn forest blurred behind. [+ style commun]`
3. `A single golden birch leaf floating on dark turquoise water. [+ style commun]`
4. `Glowing embers in a stone fire pit, sparks rising into the night. [+ style commun]`
5. `Steam rising slowly from a wooden hot tub at dawn on a deck. [+ style commun]`

### Phase 2H — Vidéos courtes Seedance/Kling (5-10s chacune)

1. **Hero loop** : voir Phase 2B
2. **Transition fog** : `Slow morning fog drifting across the screen left to right, no subject, ambient. 6s, loop-friendly.`
3. **Leaf falling** : `A single golden birch leaf falling slowly through frame from top to bottom, soft fog background. 5s.`
4. **Sauna steam** : `Slow steam rising and curling from a wooden sauna chimney, twilight backdrop. 7s, loop-friendly.`
5. **Kayak paddle** : `Slow shot of a paddle dipping into turquoise water, ripples expanding outward. 6s.`
6. **Fjord water lap** : `Calm turquoise fjord water lapping gently against rocky shore, golden hour light. 8s, loop-friendly.`
7. **Fire pit flames** : `Close-up flames in a stone fire pit at night, ambient glow, sparks. 6s, loop-friendly.`

### Pipeline post-génération

1. Sélectionner les meilleures variantes de chaque prompt
2. Convertir images PNG/JPG → AVIF via Sharp (`pnpm dlx sharp-cli` ou squoosh)
3. Convertir vidéos → MP4 H.265 + WebM VP9 fallback (ffmpeg)
4. Placer dans `public/images/` et `public/videos/` (slugs cohérents avec les composants)
5. Mettre à jour les `image: "/images/..."` paths dans `lib/data/*.ts`

## Références

- Site de référence (format structurel uniquement) : capsules.moyra.co
- Stack mirroir local : `c:\DevTools\Projects\WaaS-Websites\ttminc-website`
- Plan complet : `C:\Users\Patrick Patenaude\.claude\plans\jiggly-painting-wilkes.md`

## Commandes utiles

```bash
# Dev (port 3001)
cd C:/DevTools/Projects/WaaS-Websites/refuges-charlevoix
pnpm dev

# Build production
pnpm build && pnpm start

# Lint
pnpm lint
```
