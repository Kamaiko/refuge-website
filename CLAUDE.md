# CLAUDE.md — Refuges Charlevoix

> Reprise de contexte. Contexte du projet, la régénération complète des images et le ménage de code.

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
- **GSAP** 3.15.0 + @gsap/react
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


## Palette

Les tokens font foi dans `src/app/globals.css` — ne pas les recopier ailleurs.

## Structure du site (sections)

Ordre réel dans `src/app/page.tsx` . La liste antérieure de ce
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
| 8 | **Activites** | `SectionHeading` + paliers d'engagement |
| 9 | **Carousel** | 5 cartes en scroll horizontal épinglé |
| 10 | **Soir** | 2 rideaux éteint→allumé + titre qui se réchauffe |
| 11 | **Feedback** | Citation, reveal mot à mot |
| 12 | **Cta** | Marquee + nav + socials |
| 13 | **Footer** | Wordmark géant `AquilonReveal` |

⚠️ **`Soir` ne doit pas remonter avant Hebergements.** Elle était en position 3
et promettait « le soir, ensemble » six sections avant que le site n'en
reparle, en contradiction directe avec Hebergements (« aucun voisin ») juste
dessous. En 10 elle prolonge le Carousel, dont la dernière carte est « Le feu
de minuit » : le carousel nomme le feu comme une activité, `Soir` révèle que
c'en est une habitude.

⚠️ **Chaîne de fonds** — Activités ouvre une bande chaude (fondu base-noir →
gris-tan), Carousel et `Soir` la portent en `bg-gris-tan`, Feedback la referme
(fondu gris-tan → base-noir sur son haut). Insérer ou déplacer une section
dans ce bloc **sans lui donner `bg-gris-tan`** fait peindre à Feedback une
bande chaude sortie de nulle part.

Le composant s'appelait `Medaillons` du temps où les cartes étaient des
ovales ; la forme a changé, pas le nom.

Jamais implémentées, malgré les mentions ailleurs dans ce fichier :
`Lieu.tsx`, `Galerie.tsx`, Journal, FAQ.

## Règle éditoriale — verrouillée

> **Le refuge est privé. Le territoire se partage.**

Le logement reste absolument solitaire ; c'est la promesse produit et c'est ce
que vendent les trois descriptions de refuges. Le social est **optionnel** et
vit hors du refuge — le feu, le soir. Silence = registre dominant, ~70/30.

Tout ajout de copy ou d'image se juge là-dessus. Le registre « fête » a été
retiré partout : « Terrasse en fête » est devenue « Le passage des bélugas »,
et les médaillons ne montrent plus personne.

## Primitives partagées

| Primitive | Rôle |
|---|---|
| `SectionHeading` | Eyebrow + titre multi-lignes (depth, parallax, rideau par ligne). Choisir et Activités portaient chacune leur copie — ~125 lignes dupliquées. ⚠️ Le rideau anime **une entrée de `lines`**, pas une ligne rendue : si une entrée se replie, ses deux lignes visuelles sont révélées en bloc. D'où `linesCompact`, jeu alternatif sous `lg` — « activités du territoire » tient sur une ligne dès ~900 px mais se replie à 768. |
| `useEyebrowScrub` | Le fade-and-rise scrubbé de l'eyebrow. Choisir, Activités et Cta le partagent ; le Cta a un markup différent, d'où un hook et non un composant. |
| `useOverlayA11y` | Escape + sauvegarde/restauration du focus. Les 3 overlays en avaient chacun une copie. |
| `createOverlayContext` | Factory Provider + hook pour un overlay open/close. Menu et ReservePanel en sortent. `MapOverlayContext` reste à part (état `preloaded` en plus). |
| `usePrefersReducedMotion` | Dans `hooks/useMediaQuery.ts`. Pour **changer de layout**, pas pour animer — les paramètres d'animation passent par `gsap.matchMedia()`. |
| `wantsReducedMotion()` | Dans `lib/motion.ts`. Lecture ponctuelle dans un handler ou un effet de montage, sans souscription. |
| `RevealText` / `RevealChars` / `CurtainReveal` / `AquilonReveal` | Primitives de reveal. `RevealText` expose `start`, ce qui permet de découper un titre en plusieurs temps sans la modifier. |
| `Marquee`, `BgGradient`, `SlideIndicators`, `NavWheelLink`, `SmoothScroll`, `CustomCursor` | Inchangées. |

**Découpage** : `Pourquoi.tsx` ne garde que sa logique de scroll ; ses cartes
de présentation vivent dans `sections/pourquoi/cards.tsx` et ses données +
constantes dérivées dans `sections/pourquoi/slides.ts`. Les autres gros
fichiers (`MapOverlay`, `ReservePanel`, `Carousel`, `Header`, `Hebergements`)
sont longs mais cohérents — les découper par taille seule disperserait la
logique sans rien clarifier.

⚠️ **Les données du Carousel sont dans `Carousel.tsx`**, pas dans
`src/lib/data`. Le genre de détail qui fait perdre dix minutes trois semaines
plus tard.

### Assets — état

Toutes les images live sont générées et rangées par section :

Toutes les images live sont generees et rangees par section sous `public/images/` (un dossier par section) et `public/videos/`.

⚠️ **Art direction, pas responsive.** Le hero et les cartes `Hebergements`
sont `absolute inset-0` dans un cadre `~100svh` : sur un téléphone ce cadre
fait **0,446** de ratio, et une source 16:9 y perd **75 % de sa largeur**.
Les variantes portrait sont servies par un `<picture>` + `<source media>` —
`next/image` n'a aucune échappatoire pour ça, un seul `src` et `sizes` ne
choisit qu'une *largeur* du même recadrage. Le `<link rel="preload">` du hero
est dédoublé avec un attribut `media` sur chacun, sans quoi les téléphones
tirent aussi le fichier paysage.

`imagePortrait` dans `src/lib/data/refuges.ts` est **optionnel** : un refuge
sans variante garde son paysage partout. Seul Brume en a une pour l'instant.

⚠️ **Les vidéos ne bouclent pas nativement** — aucun modèle ne revient à son
image de départ. Les deux boucles sont recousues en post par un fondu de queue
sur tête ; la recette et les mesures sont dans `docs/assets-a-generer.md`.

⚠️ Les sources 4k et les variantes écartées vivent dans **`/assets-raw/`** à la
racine, **hors de `public/`** et gitignorées. Elles y étaient auparavant
(`public/images/_raw/`, volumineux) : gitignorées mais tout de même servies par
`next dev` et copiées par tout build local. `public/` doit rester leger.

Le pipeline, les prompts littéraux et les règles de brief apprises sont dans
**`docs/assets-a-generer.md`** ; ce qui reste à produire est dans
**`docs/backlog.md`**.

⏳ **Reste** : voir `docs/backlog.md` — portraits d'Aubépine et Galets,
regénération du hero (le portrait actuel est un plan large là où le desktop
est un gros plan) et de la vidéo desktop, `lieu-charlevoix`, galerie, envoi
réel des réservations (Resend jamais branché), audit Lighthouse.

## Note sur le nom de marque

**Aquilon** — vent du nord en latin/littéraire (de l'antiquité romaine). Choisi pour son registre érudit, sa rareté en hospitalité, et l'écho avec le contexte maritime nordique du St-Laurent. À noter : l'un des trois refuges s'appelle quand même "Brume" (slug `brume` dans `src/lib/data/refuges.ts`) — c'est intentionnel, le mot reste utilisé comme nom de produit, pas comme nom de marque.

**Pour renommer** : éditer `SITE_CONFIG.name` et `SITE_CONFIG.brandMark` dans `src/lib/constants.ts`. Les chaînes affichées (eyebrow, marquee, manifeste, feedback) sont actuellement hardcoded — chercher littéralement "Aquilon" pour les retrouver.

## Reduced motion

Règles complètes : `docs/reduced-motion.md`. Retenir : la règle CSS ne coupe **pas** les tweens ni le ticker GSAP — chaque source de mouvement JS doit se couper elle-même.

## Références

- Site de référence (format structurel uniquement) : capsules.moyra.co
- Stack mirroir local : `C:\Nexus\Projects\Web\ttminc-website`
- `docs/assets-a-generer.md` — pipeline Higgsfield, prompts littéraux, règles de brief
- `docs/backlog.md` — dette assumée, avec le *pourquoi* de chaque report

## Pièges connus

Voir `docs/depannage.md` (dont le serveur de dev qui sert un CSS périmé — panne silencieuse).

## Commandes utiles

```bash
# Dev (port 3001)
cd C:/Nexus/Projects/Web/refuges-charlevoix
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




