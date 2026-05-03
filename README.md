<div align="center">

# Aquilon

#### Refuges contemporains au creux du fjord de Charlevoix.

</div>

<br>

![Aquilon hero](docs/hero-aquilon.png)

<br>

---

<br>

## À propos

Site portfolio éditorial pour **Aquilon**, marque fictive de trois refuges architecturaux posés dans la forêt boréale de Charlevoix. Récit narratif au scroll lent, contemplatif — wordmark hero, manifeste défilant, médaillons parallaxés, slideshow épinglé des trois refuges, panneau de réservation à droite.

Marque, copie et imagerie 100 % originales. Concept design, pas un service réel.

<br>

---

<br>

## Stack

<br>

| | |
|---|---|
| **Framework** | Next.js 16 · React 19 · App Router |
| **Langage** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 · `@theme` tokens |
| **Animation** | GSAP 3.15 · ScrollTrigger · `@gsap/react` |
| **Smooth scroll** | Lenis |
| **Forms** | Server Actions · Zod |
| **Typographie** | Host Grotesk |

<br>

---

<br>

## Structure

<br>

```
app/                # App Router · layout · globals.css (tokens Tailwind v4)
actions/            # Server Actions (validation Zod)
components/
  common/           # Primitives réutilisables · contexts (Menu, Reserve, SmoothScroll)
  layout/           # Header
  sections/         # 7 sections de la page d'accueil
lib/                # SITE_CONFIG · données refuges · timing GSAP partagé
docs/               # Documentation et captures
public/             # Logos · images · vidéos
```

<br>

---

<br>

## Lancement

<br>

```bash
pnpm install
pnpm dev          # http://localhost:3001
```

`pnpm build && pnpm start` pour la production · `pnpm lint` pour ESLint.

<br>

---

<br>

<div align="center">

**Patrick Patenaude** · Montréal · 2026

</div>
