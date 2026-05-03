# Aquilon — Refuges Charlevoix

A portfolio piece exploring premium hospitality web design for a fictional brand of three architect-designed refuges set in the boreal forest of Charlevoix, Québec.

![Aquilon hero](docs/hero.png)

> **Live status** · Concept project. The brand, copy, and imagery are entirely original. Not a real lodging business.

---

## What it is

A single-page editorial site built around a slow, contemplative scroll narrative — wordmark hero, scroll-driven manifesto, parallaxed avant-goût, pinned card-stack slideshow of the three refuges, and a slide-in reservation panel wired to a Server Action. Inspired structurally by the Awwwards-tier hospitality genre; every line of code, every word of copy, every image is original.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (`@theme` design tokens) |
| Animation | GSAP 3.15 + ScrollTrigger + `@gsap/react` |
| Smooth scroll | Lenis |
| Forms | Server Actions + Zod |
| Fonts | Host Grotesk (Google Fonts) |

## Engineering highlights

A few things worth opening the source for:

- **`MenuOverlay`** — Full-screen menu that physically morphs from the bottom-center pill CTA into a near-fullscreen rounded card. The corner radius is recomputed each frame as a blend of the pill cap (`min(w,h)/2`) and the open radius, so the corners morph continuously rather than snapping when CSS's auto-cap kicks in. `overwrite: true` everywhere — re-toggling mid-animation reverses gracefully without stacking conflicting tweens.
- **`Capsules`** — Pinned scroll-scrub stack of three cards. Card 0 grows from a stadium pill into a fullscreen rounded card while cards 1 and 2 slide up over it, scaling the stack down underneath. Per-card text reveals are driven imperatively from the timeline's `onUpdate` (not scroll position), because the cards themselves are moved by the timeline. Mobile pin range is halved.
- **`SmoothScroll`** — Owns the global Lenis lifecycle, syncs with ScrollTrigger's ticker, and forwards `focusin` events to Lenis so keyboard navigation works (Lenis virtualises scroll, so the browser's native auto-scroll never fires). Skips elements inside fixed/sticky ancestors so clicking the pinned CTAs doesn't jump the page.
- **`CurtainReveal`** — Scroll-scrubbed sharp-edged wipe between two stacked text copies (cream and a darker filter), clipped complementarily so only one layer paints at any pixel — avoids the subpixel-antialiasing halo a naive overlay produces.
- **`Marquee`** — Infinite horizontal scroll using GSAP's `modifiers.x` + `gsap.utils.wrap` to keep the tween's accumulated time within precision bounds (long-idle sessions used to drift visually after enough iterations).
- **Accessibility** — `prefers-reduced-motion` honored on every scroll-driven section (Hero, Capsules, Choisir, Medaillons, Manifeste). Focus-visible rings, semantic landmarks, ARIA labels on the floating CTAs.

## Run locally

```bash
pnpm install
pnpm dev    # http://localhost:3001
```

`pnpm build && pnpm start` for the production bundle. `pnpm lint` runs ESLint.

## Project structure

```
app/                      # App Router pages, layout, globals.css (Tailwind v4 tokens)
actions/                  # Server Actions (Zod-validated)
components/
  common/                 # Reusable primitives + contexts (Menu, Reserve, SmoothScroll, …)
  layout/                 # Header (top-left logo, Reserve CTA, Menu CTA)
  sections/               # The 7 scroll sections of the home page
lib/
  constants.ts            # SITE_CONFIG (brand strings)
  motion.ts               # Shared GSAP timing constants
  data/unites.ts          # The three refuges
  gsap.ts                 # GSAP singleton + ScrollTrigger registration
docs/                     # Project docs and screenshots
```

## Status

The frontend is feature-complete. Pending work, tracked in [`CLAUDE.md`](CLAUDE.md):

- Generate the AI image and video assets (~30 images, ~10 videos) — prompts catalogued in `CLAUDE.md`.
- Replace the placeholder unit covers with the generated AVIFs.
- Wire the reservation Server Action to a transactional email provider (Resend).
- Lighthouse pass (target: desktop ≥ 95, mobile ≥ 80) once assets are in.

## Notes on inspiration

The site borrows *structural* conventions from the Awwwards hospitality genre (`capsules.moyra.co` was studied as a technical reference for scroll patterns, font choice, and base palette). No code, copy, imagery, or branding was reproduced — see `CLAUDE.md` for the full IP discipline notes.

---

**Patrick Patenaude** · Built in Montréal, 2026.
