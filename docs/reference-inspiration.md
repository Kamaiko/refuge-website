# Inspection technique — site de reference

## Inspection technique de capsules.moyra.co (référence)

Relevé via Playwright. Findings techniques uniquement :

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
- 9 sections, scroll long
- images et vidéos, pas de canvas
- boutons (CTA persistants : Reserve top-right, Menu bottom-center, badge latéral)

### Patterns techniques observés (à réimplémenter avec contenu original)
- Hero full-viewport (h-svh) avec architecture en photo + wordmark massif
- Section unit showcase scroll-pinned avec image en rounded card centrée
- Background wordmark parallax (s'étire derrière l'image au scroll)
- Manifesto avec scroll-driven typography (texte qui passe de transparent à opaque mot par mot)
- Activity grid horizontal scroll avec rounded card images + métadonnées (difficulté, durée)
- Persistent floating menu CTA bottom-center

