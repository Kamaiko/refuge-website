# CLAUDE.md — Refuges Charlevoix

> Reprise de contexte. À jour au 10 août 2026 — après la passe éditoriale, la régénération complète des images et le ménage de code.

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

**Layout `src/`** : tout le code applicatif vit sous `src/` (`app/`, `components/`,
`lib/`, `hooks/`, `actions/`). La racine ne garde que la config (`next.config.ts`,
`tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`), `public/`, `docs/` et
les fichiers de projet. L'alias `@/*` pointe sur `./src/*` (`tsconfig.json`).
⚠️ `public/` **ne peut pas** aller sous `src/` (Next ne le lit qu'à la racine).

## Décisions verrouillées

| Décision | Choix |
|---|---|
| Stack | Next.js 16 + GSAP + TS + Tailwind v4 + Lenis |
| Région | Charlevoix (fjord, fleuve, montagnes) |
| Saison dominante | Été + automne |
| Nombre d'unités | 3 |
| Architecture | Capsule « stadium » — pill horizontal, bouts arrondis. Canon dans `docs/backlog.md`, réf `assets-raw/refs/canon-capsule.jpg` |
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
/* En usage */
--color-base-noir: #181717        /* fond principal */
--color-base-noir-soft: #1F1E1E   /* surfaces secondaires */
--color-creme: #F4EFE7            /* texte principal */
--color-creme-dim: #C9C5BD        /* texte secondaire */
--color-creme-terre: #E8DCC4      /* texte secondaire chaud */
--color-gris-tan: #2A2725         /* panneaux, cartes */
--color-gris-tan-soft: #3A3631
--color-gris-secondaire: #6B6660
--color-turquoise: #4FB8B0        /* ::selection */
--color-orange-sunset: #C2410C    /* erreurs de formulaire */

/* Palette de réserve — déclarée, aucun point d'appel. Gardée volontairement :
   c'est la palette Charlevoix documentée et le grade des photos est construit
   autour. Signalée comme telle dans globals.css pour qu'on ne la prenne pas
   pour un oubli. */
--color-vert-sapin: #2D5F4E
--color-vert-sapin-deep: #1F4338
--color-turquoise-deep: #2C8A82
--color-or-ambre: #D97706
```

**Autres tokens** (`@theme` dans `globals.css`) : rayons `--radius-{pill,card,
soft,frame,hero}` — utiliser ces tokens, pas des `rounded-[Npx]`. Classes
composants : `.focus-ring` (l'anneau de focus clavier, était recopié 6 fois),
`.eyebrow`, `.type-section-title`, `.type-wordmark-band`.

⚠️ `--ease-cinematic` / `--ease-soft` ont été **supprimés** : `lib/motion.ts`
prétendait les refléter mais utilisait des eases GSAP nommés — un contrat
faux valait moins que pas de contrat.

## Structure du site (sections)

Ordre réel dans `src/app/page.tsx` (13 sections). La liste antérieure de ce
fichier décrivait un plan de conception jamais implémenté tel quel — voici ce
qui existe :

| # | Section | Rôle |
|---|---|---|
| 1 | **Hero** | Vidéo loop en fond, wordmark, tagline |
| 2 | **Manifeste** | `CurtainReveal` scrubbé sur une phrase |
| 3 | **Choisir** | `SectionHeading` + pastilles de principes |
| 4 | **Hebergements** | Pile de cartes épinglée, une par refuge |
| 5 | **Proximite** | CTA qui ouvre la `MapOverlay` |
| 6 | **MarqueeBrand** | Bande « Pourquoi Aquilon ? », décorative |
| 7 | **Pourquoi** | 3 slides, wheel-hijack + rideau + dolly |
| 8 | **Medaillons** | Charnière jour→soir, 2 rideaux + texte qui se réchauffe |
| 9 | **Activites** | `SectionHeading` + paliers d'engagement |
| 10 | **Carousel** | 5 cartes en scroll horizontal épinglé |
| 11 | **Feedback** | Citation, reveal mot à mot |
| 12 | **Cta** | Marquee + nav + socials |
| 13 | **Footer** | Wordmark géant `AquilonReveal` |

⚠️ **Medaillons doit rester en position 8.** Elle était en 3 et promettait
« le soir, ensemble » six sections avant que le site n'en reparle, en
contradiction directe avec Hebergements (« aucun voisin ») juste dessous.
En 8 elle fait charnière : Pourquoi pose la distance, Medaillons allume le
feu, Activités ouvre sur « Seul, ou tous ensemble ».

Jamais implémentées, malgré les mentions ailleurs dans ce fichier :
`Lieu.tsx`, `Galerie.tsx`, Journal, FAQ.

| `createOverlayContext` | Factory Provider + hook pour un overlay open/close. Menu et ReservePanel en sortent. `MapOverlayContext` reste à part (état `preloaded` en plus). |
| `usePrefersReducedMotion` | Dans `hooks/useMediaQuery.ts`. Pour **changer de layout**, pas pour animer — les paramètres d'animation passent par `gsap.matchMedia()`. |
| `wantsReducedMotion()` | Dans `lib/motion.ts`. Lecture ponctuelle dans un handler ou un effet de montage, sans souscription. |
| `RevealText` / `RevealChars` / `CurtainReveal` / `AquilonReveal` | Primitives de reveal. `RevealText` expose `start`, ce qui permet de découper un titre en plusieurs temps sans la modifier. |
| `Marquee`, `BgGradient`, `SlideIndicators`, `NavWheelLink`, `SmoothScroll`, `CustomCursor` | Inchangées. |

### Assets — état

Toutes les images live sont générées et rangées par section :

```
public/images/
├── hero-shape.avif          poster LCP + image OG
├── photo-patrick.avif       avatar Feedback
├── refuges/     brume, aubepine, galets
├── pourquoi/    aube, fjord, crete
├── medaillons/  feu-{eteint,allume}, terrasse-{eteint,allume}
└── activites/   kayak, sommet, via-ferrata, belugas, veillee
```

⚠️ Les sources 4k et les variantes écartées vivent dans **`/assets-raw/`** à la
racine, **hors de `public/`** et gitignorées. Elles y étaient auparavant
(`public/images/_raw/`, 1,25 Go) : gitignorées mais tout de même servies par
`next dev` et copiées par tout build local. `public/` fait 6,8 Mo aujourd'hui.

Le pipeline, les prompts littéraux et les règles de brief apprises sont dans
**`docs/assets-a-generer.md`** ; ce qui reste à produire est dans
**`docs/backlog.md`**.

⏳ **Reste** : voir `docs/backlog.md` — art direction du hero en portrait,
passe copy complète, `lieu-charlevoix`, galerie, vidéos d'ambiance, envoi réel
des réservations (Resend jamais branché), audit Lighthouse.

## Note sur le nom de marque

**Aquilon** — vent du nord en latin/littéraire (de l'antiquité romaine). Choisi pour son registre érudit, sa rareté en hospitalité, et l'écho avec le contexte maritime nordique du St-Laurent. À noter : l'un des trois refuges s'appelle quand même "Brume" (slug `brume` dans `src/lib/data/refuges.ts`) — c'est intentionnel, le mot reste utilisé comme nom de produit, pas comme nom de marque.

**Pour renommer** : éditer `SITE_CONFIG.name` et `SITE_CONFIG.brandMark` dans `src/lib/constants.ts`. Les chaînes affichées (eyebrow, marquee, manifeste, feedback) sont actuellement hardcoded — chercher littéralement "Aquilon" pour les retrouver.

## Reduced motion — règles du projet

Le site tombe en panne de façon **silencieuse** sous `prefers-reduced-motion`
si on n'y prend pas garde, parce que beaucoup d'éléments partent d'un état
invisible (`opacity: 0` inline, `visibility: hidden`, `clip-path: inset(100%)`,
glyphes parqués hors champ) et comptent sur une animation pour arriver. Trois
pertes de contenu ont déjà été corrigées à ce titre — le Hero rendait une image
sans un seul mot dessus.

Trois outils, à ne pas confondre :

1. **`gsap.matchMedia()`** pour les paramètres d'animation. Toujours écrire la
   branche `(prefers-reduced-motion: reduce)` quand l'élément part d'un état
   invisible — ce n'est pas facultatif, c'est ce qui le rend visible.
2. **`usePrefersReducedMotion()`** quand il faut changer de **layout**.
   Carousel et Pourquoi s'en servent pour rendre leur pile mobile à toutes les
   largeurs : leur piste desktop est entièrement pilotée par ScrollTrigger, donc
   sans pin les cartes suivantes seraient inatteignables.
3. **`wantsReducedMotion()`** pour une lecture ponctuelle dans un handler ou un
   effet de montage, quand souscrire n'apporterait rien.

Les primitives `RevealChars` et `AquilonReveal` gèrent le cas **elles-mêmes** :
parquer les glyphes hors champ ne marche que si quelqu'un lève `play` ensuite,
et au moins un appelant le pilote depuis une branche `no-preference`.

## Références

- Site de référence (format structurel uniquement) : capsules.moyra.co
- Stack mirroir local : `c:\DevTools\Projects\WaaS-Websites\ttminc-website`
- `docs/assets-a-generer.md` — pipeline Higgsfield, prompts littéraux, règles de brief
- `docs/backlog.md` — dette assumée, avec le *pourquoi* de chaque report

## Commandes utiles

```bash
# Dev (port 3001)
cd C:/DevTools/Projects/WaaS-Websites/refuges-charlevoix
pnpm dev

# Build production
pnpm build && pnpm start

# Lint + typecheck (les deux, le lint seul ne suffit pas)
pnpm lint && npx tsc --noEmit

# Génération d'image (voir docs/assets-a-generer.md pour les prompts)
higgsfield account status
higgsfield generate create nano_banana_2 --aspect_ratio 3:2 --resolution 4k \
  --image assets-raw/refs/canon-capsule.jpg --wait --prompt "…"

# Conversion AVIF — paysage 2400, portrait 1600. L'unsharp après
# redimensionnement récupère du piqué perçu, gratuitement.
ffmpeg -y -i src.png -vf "scale=2400:-2,unsharp=5:5:0.4:5:5:0.0" \
  -c:v libaom-av1 -still-picture 1 -cpu-used 6 -crf 30 -pix_fmt yuv420p out.avif
```
