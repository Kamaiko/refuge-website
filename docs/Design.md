# Design System — Refuges Charlevoix (Brume®)

Source de vérité pour les tokens, la typographie, les radii, le motion et le spacing du site. Tout nouveau composant doit puiser dans ces valeurs (importées depuis `app/globals.css` et `lib/motion.ts`) plutôt que de hardcoder.

---

## 1. Palette

Tokens définis dans `app/globals.css` sous `@theme`. Utilisés via classes Tailwind `bg-*`, `text-*`, `border-*` ou variables CSS `var(--color-*)`.

### Fonds

| Token | Hex | Usage |
|---|---|---|
| `--color-base-noir` | `#181717` | Fond principal du site (Hero, Manifeste, Capsules, Feedback) |
| `--color-base-noir-soft` | `#1F1E1E` | Variante légèrement plus claire (cards sur fond noir) |
| `--color-gris-tan` | `#2A2725` | Surfaces secondaires (Reserve panel, Menu overlay, Choisir, cercles intérieurs des CTAs Header) |
| `--color-gris-tan-soft` | `#3A3631` | Surfaces tertiaires (filtres curtain reveal, hover states subtils) |
| `--color-gris-tan-warm` | `#44403B` | Accent chaud rare (séparateurs, borders sur fond gris-tan) |

### Texte

| Token | Hex | Usage |
|---|---|---|
| `--color-creme` | `#F4EFE7` | Texte primaire (headlines, body principal, CTA labels) |
| `--color-creme-dim` | `#C9C5BD` | Texte secondaire (sous-titres, eyebrows mi-prominents) |
| `--color-creme-terre` | `#E8DCC4` | Beige chaud — items du Menu overlay, accents nature |
| `--color-gris-secondaire` | `#6B6660` | Texte de bord (numérotation discrète, captions, labels minimaux) |

### Couleurs identitaires (rares, accent uniquement)

| Token | Hex | Usage |
|---|---|---|
| `--color-vert-sapin` | `#2D5F4E` | Forêt boréale (rare, accent saisonnier) |
| `--color-vert-sapin-deep` | `#1F4338` | Variante profonde |
| `--color-turquoise` | `#4FB8B0` | Eau du fjord (feedback succès, hover states) |
| `--color-turquoise-deep` | `#2C8A82` | Variante profonde |
| `--color-orange-sunset` | `#C2410C` | Coucher St-Laurent (selection text, errors, hover rare) |
| `--color-or-ambre` | `#D97706` | Lumière dorée (très rare, accent saisonnier automne) |

### Règles d'usage couleur

1. **Fond noir → texte creme** par défaut. Ne jamais utiliser texte noir sur fond clair (le site est dark-mode-only).
2. **Surfaces secondaires (gris-tan)** doivent contraster avec le noir d'au moins 1 step. Jamais coller deux surfaces gris-tan adjacentes sans séparation.
3. **Hover states** : passer de `creme/70` ou `creme/85` vers `creme` plein, jamais l'inverse.
4. **Couleurs identitaires** : 1-2 occurrences max par section, jamais en aplat de fond.

---

## 2. Typography

Une seule famille : **Host Grotesk** (variable, chargée via `next/font` dans `app/layout.tsx`).

### Échelle

| Niveau | Tailwind class | Usage |
|---|---|---|
| Display | `text-[12vw] md:text-[15vw]` | Wordmark "Brume®" derrière Capsules, titre Choisir |
| H1 (hero tagline) | `text-4xl md:text-6xl` | Hero principal |
| H2 (section headline) | `text-3xl md:text-4xl lg:text-5xl` | Manifeste, Feedback testimonial |
| H3 (sous-section) | `text-2xl md:text-3xl` | Cards, sous-titres internes |
| Body large | `text-lg md:text-xl` | Hero subcopy, Reserve panel description |
| Body | `text-base` | Paragraphes courants |
| Body small | `text-sm` | Form labels, panel meta |
| Caption | `text-xs uppercase tracking-[0.3em]` | Eyebrows, métadonnées top |
| Mini caption | `text-[10px] uppercase tracking-[0.2em]` | Labels in-pill (Séjour / Estimation) |

### Poids

- `font-light` (300) : ne pas utiliser, trop fin pour Host Grotesk
- `font-normal` (400) : par défaut sur body
- `font-medium` (500) : sous-titres, eyebrows secondaires
- `font-semibold` (600) : headlines, CTAs, accents

### Tracking

- Headlines : `tracking-tight` (-0.025em) ou `tracking-[-0.04em]` pour très gros
- Body : `tracking-normal`
- Eyebrows / captions : `tracking-[0.3em]` ou `tracking-[0.2em]` pour mini

### Leading

- Headlines : `leading-[1.05]` ou `leading-[0.86]` pour display
- Body : `leading-relaxed` (1.625)
- Captions : `leading-tight`

---

## 3. Radius

Tokens définis dans `globals.css`, utilisables via `rounded-pill`, `rounded-card`, `rounded-soft`, `rounded-tight`.

| Token | Valeur | Usage |
|---|---|---|
| `--radius-pill` | `9999px` | CTAs Header (Menu, Reserve), pills de bottom bar Reserve, capsules cards |
| `--radius-card` | `28px` | Image panels Menu overlay, cards Capsules avant expansion fullscreen |
| `--radius-soft` | `16px` | Inputs (date pickers), boutons secondaires, refuge selectors |
| `--radius-tight` | `8px` | Petits éléments (badges, tags) |

### Cas spéciaux

- Hero outer frame : `rounded-[60px]` (custom, plus grand que card)
- Reserve panel : `rounded-[36px]` (custom, intermédiaire pill/card)
- Menu overlay frame : `rounded-[60px]` (matching Hero)

---

## 4. Motion

Toutes les valeurs JS dans `lib/motion.ts`. Les easings CSS dans `globals.css` (`--ease-cinematic`, `--ease-soft`).

### Durations

| Constante | Valeur | Usage |
|---|---|---|
| `SCROLL_OUT.duration` | `0.5s` | Header buttons hide/show on scroll |
| `SCROLL_OUT.delay` | `0.35s` | Delay avant qu'un scroll-out commence (anti-jitter) |

Reveal-style durations (1.1s / 0.85s / 0.55s) restent inline dans les composants — pas extraites tant qu'on ne les réutilise pas à plusieurs endroits.

### Easings

| Constante | Valeur | Usage |
|---|---|---|
| `PANEL.ease` | `expo.out` | Slide-in panels (Reserve, Menu) — feel cinématique |
| `PANEL.closeEase` | `expo.in` | Slide-out panels — feel snap |
| CSS `--ease-cinematic` | `cubic-bezier(0.65, 0, 0.35, 1)` | Transitions Tailwind (`transition-*`) |
| CSS `--ease-soft` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Hover smooth, slow fades |

### Capsules section

| Constante | Valeur | Usage |
|---|---|---|
| `CAPSULES.stickyDuration` | `+=600%` | Durée scroll de la section pinnée (~6 viewports) |
| `CAPSULES.scaleStep` | `0.07` | Réduction de scale par card stackée |

---

## 5. Spacing

### Section padding

- Vertical : `py-32 md:py-48` (128px → 192px)
- Horizontal : `px-5 md:px-8` (20px → 32px)
- Pour sections fullscreen pinnées : `min-h-[100svh]` ou `min-h-[100vh]`

### Container max-width

- Standard : `max-w-5xl` (1024px) pour text-heavy sections (Feedback)
- Wide : `max-w-[1800px]` pour sections display (Choisir, Capsules)

### Outer page frame

- Hero, Menu overlay : padding outer `p-3 md:p-4` (12px → 16px) avec inner `rounded-[60px]`
- Reserve panel : `top-4 right-4 bottom-4` (16px gap from edge)

### Gap interne

- Stack vertical headlines/body : `mt-4` (16px) entre eyebrow→headline, `mt-10` (40px) entre headline→body
- Form fieldsets : `gap-12` (48px) entre fieldsets, `gap-4` (16px) intra-fieldset
- Grid items : `gap-2` (8px) pour grilles compactes (refuge selectors), `gap-6` (24px) pour grilles aérées

---

## 6. Iconographie

- **Style** : hairline, stroke `1.5px`, pas de fill
- **Taille standard** : `w-5 h-5` ou `w-6 h-6` (16-24px)
- **Couleur** : `text-creme` ou `text-creme/85` selon contexte
- **Hover** : `hover:text-creme` si baseline est `creme/70` ou `creme/85`
- **Icônes utilisées** : X (close), arrow (CTA Reserve), hamburger (3 lignes Menu), Instagram + LinkedIn (sociaux Menu)

### Hamburger spec

- 3 lignes horizontales
- Stroke height `1.5px`, width `w-6` (24px)
- Gap `gap-1.5` (6px) entre lignes
- Color : `bg-creme/85` (matching icônes)

### Arrow CTA spec

- 12×12 viewBox
- Stroke `1.5px`, color `text-creme/85` (sur cercle gris-tan)
- Direction : diagonal up-right (départ vers une nouvelle vue)

---

## 7. Anti-patterns à éviter

❌ Hardcoder une couleur hex dans un composant — toujours passer par un token Tailwind
❌ Utiliser `font-light` sur Host Grotesk (trop fin, problème de lisibilité)
❌ Mélanger 2 fonts (le site est mono-typeface)
❌ Animer plus de 1 propriété par tween sauf grouping naturel (transform = scale + xPercent + yPercent OK ; opacity dans le même tween OK)
❌ Utiliser `duration` non listé ici sauf cas exceptionnel — préférer importer depuis `motion.ts`
❌ Rounded values custom au pifomètre — utiliser `rounded-pill/card/soft/tight`
❌ Couleur identitaire (turquoise/orange) en aplat de fond
❌ Headlines centrés sans intention (alignement gauche par défaut)

---

## 8. Quick reference imports

```tsx
// JS motion constants
import { PANEL, SCROLL_OUT, CAPSULES } from "@/lib/motion";

// Tailwind classes (auto-generated from globals.css @theme)
className="bg-base-noir text-creme rounded-card"
className="text-creme-terre/70 hover:text-creme transition-colors duration-500"
className="text-xs uppercase tracking-[0.3em] text-creme-dim"
```
