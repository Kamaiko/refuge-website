# Backlog — Aquilon

> Ce qui reste à faire, et ce qu'on a décidé de **ne pas** faire. Chaque entrée
> dit *pourquoi* elle attend, pour qu'on la reprenne sans réinstruire le
> contexte. Les dossiers clos sont en fin de fichier, réduits à ce qu'ils
> apprennent — s'ils n'apprennent rien, ils n'y sont plus.
>
> Dernière remise en ordre : **2026-09-14**.

---

## ✅ Contrôles de santé — passés le 2026-09-14

| Contrôle | Commande | État |
|---|---|---|
| Types | `npx tsc --noEmit` | passe |
| Lint | `pnpm lint` | passe, 0 avertissement |
| Build de production | `pnpm build` | passe, 8 pages statiques |
| Console du navigateur | production locale (`next start`), page d'accueil, scroll complet | **0 erreur, 0 avertissement** |
| Chemins cités dans la doc | existent tous | oui — hors trois mentions voulues : accolades, ancien `_raw/`, `z-index.ts` à créer |
| Racine du dépôt | aucun fichier de travail | propre |

> ⚠️ Une erreur d'hydratation vivait dans `ReservePanel` (« 5 nuits » au client
> contre « — » au serveur) : les dates étaient semées **pendant le rendu**
> derrière un `typeof window`. Corrigée le 2026-09-08 — elles le sont désormais
> dans un effet, après hydratation. Un mismatch fait régénérer tout le
> sous-arbre : c'était plus cher que le rendu supplémentaire qu'on évitait.

---

## 🚧 Bloquant avant toute mise en ligne

### Le formulaire de réservation ment à l'utilisateur

`src/actions/reservation.ts` valide en Zod et retourne un message de succès,
mais **l'intégration Resend n'a jamais été branchée**. Une réservation envoyée
aujourd'hui n'arrive nulle part, et l'utilisateur lit « merci ».

### L'URL du site est figée sur `localhost:3001`

`layout.tsx:24` et `:67`, `robots.ts:52`, `sitemap.ts:68` retombent tous sur
`"http://localhost:3001"` faute de `NEXT_PUBLIC_SITE_URL`, et aucun `.env*`
n'existe. Vérifié dans les artefacts de build : `robots.txt`, `sitemap.xml`,
`og:image` et le JSON-LD portent tous cette URL.

Rien n'est cassé tant que le site n'est pas déployé — mais ça se déclenchera
**exactement une fois**, au premier déploiement, avec des aperçus sociaux morts
et un sitemap invalide. Le fallback est silencieux.

> Premier geste : faire **échouer le build** en production quand la variable
> manque, au lieu de le laisser réussir faux.

### Ancres orphelines

`#choisir`, `#proximite` et `#cta` sont déclarées sur les sections mais absentes
de `src/lib/data/nav.ts`.

---

## 🔴 Correctness — relevé à l'audit du 2026-08-30, toujours ouvert

### `useGSAP` + `dependencies` ne nettoie pas

Dans `@gsap/react` 2.1.2 (`dist/index.js:41-51`), avec des `dependencies` non
vides et sans `revertOnUpdate`, **l'effet ne retourne aucun cleanup après le
premier montage** :

```js
deferCleanup = dependencies && dependencies.length && !revertOnUpdate;
useIsomorphicLayoutEffect(() => {
  callback && context.current.add(callback, scope);
  if (!deferCleanup || !mounted.current) { return () => context.current.revert(); }
}, dependencies);
```

Conséquence mesurée : des tickers continuent de tourner, y compris sous
reduced-motion.

### `Pourquoi` — deux tiers de la section inatteignables sur tablette tactile

`Pourquoi.tsx:298` — avancer de slide dépend uniquement d'un listener `wheel`.
La pile desktop s'affiche dès `MQ.mdUp`, la pile mobile est `md:hidden`. Un iPad
(768 portrait, 1024 paysage) n'émet aucun `wheel` au doigt : **les slides 2 et 3
ne sont jamais atteignables**, et le pin `+=200` fait passer tout droit après la
slide 1. Le Carousel couvre ce cas, Pourquoi non.

> Premier geste, quasi gratuit : gater la piste desktop sur `(pointer: fine)` en
> plus de `MQ.mdUp` — la pile verticale prend alors le relais sur tablette.
> Plus ambitieux : des flèches prev/next appelant le `tweenTo` déjà présent, ce
> qui réglerait aussi l'accès clavier.

### `aria-label` sur un `<span>` est ignoré

`Feedback.tsx` (`WordSplit`) et `RevealChars.tsx:124` — un `aria-label` sur un
élément sans rôle n'est pas restitué. Le texte découpé par glyphe est donc lu
lettre par lettre, ou pas du tout.

### Carousel — reduced-motion sur desktop à la souris

Sous `prefers-reduced-motion`, le Carousel bascule sur la piste mobile (scroll
horizontal `snap-x`) à toutes les largeurs. Ça règle le cas tactile, mais à la
souris cette piste est difficile d'accès : sa barre de défilement est masquée
deux fois (`.no-scrollbar` et le `scrollbar-width: none !important` global) et
elle n'est pas focusable. Trou étroit — reduced-motion **et** desktop **et**
souris — mais réel. Le correctif propre est une mise en page verticale empilée
pour ce cas, ou une piste focusable avec contrôles visibles.

---

## 🎨 Assets — reste à produire

- `lieu-charlevoix.avif` (4:5) — pour `Lieu.tsx`, **section non implémentée**
- Galerie d'ambiance, 6 images — pour `Galerie.tsx`, **non implémentée**
- Vidéos d'ambiance (brume, feuille, eau)
- **Vidéo hero portrait — encodée en crf 24**, sous le plancher de 19 que fixe
  `assets-a-generer.md` : 1,52 Mbps contre 8,3 pour sa source native, SSIM
  0,947. Correction gratuite, jamais faite : recoudre la boucle depuis
  `assets-raw/finals/hero-loop-portrait-src.mp4` en crf 19, avec le grade de
  `hero-portrait-GRADE.txt`. Relevé le 2026-09-13 et laissé hors du chantier
  desktop, sur décision de Patrick — personne ne s'en est plaint au téléphone.
- **`refuges/brume.avif` — à refaire au canon.** Deux fois moins de détail que
  ses voisines (détail relatif : 50 %) et aucun master 4K. Deux essais écartés le
  2026-09-14 : upscale fidèle (56 %, premier plan redessiné) et régénération
  `--image` (80 %, mais coque texturée — hors Bloc A). Palette mesurée : Brume
  n'est **pas** plus « coucher de soleil » que les deux autres — la moins orange
  (17 % contre 34 %), le ciel le plus proche du canon —, mais plus pâle
  (saturation 0,36 contre 0,41) et plus molle.
  > Recommandé : régénérer depuis les blocs A + B + C **sans `--image`**, décor
  > lac et brume gardé, et la laisser en tête de pile — la déplacer ne règle ni
  > le détail ni la texture.
- `assets-raw/_INDEX.md` est resté au lot de juin (chemins `_raw/`, anciens
  noms) : à refaire, ou à supprimer au profit de `assets-a-generer.md`.

Le pipeline, les prompts littéraux et les règles de brief sont dans
**`docs/assets-a-generer.md`** — pas ici.

---

## ⚡ Performance — à mesurer en production

Lighthouse relevé par Patrick le 2026-09-14 : **100 / 93 / 100 / 100**
(Performance, Accessibilité, Bonnes pratiques, SEO ; mode mobile ou bureau non
noté). Le 93 est l'**accessibilité** — les `aria-label` ignorés plus haut en
sont une cause connue. La performance au chargement n'est pas un sujet.

### CLS à 3,4 au scroll — non confirmé, la méthode l'exagère

Cumul brut des `layout-shift` sur un scroll scripté de toute la page (bureau
3,4 ; mobile 1,5). Trois biais connus : un cumul au lieu des fenêtres de
session de Web Vitals, un scroll programmatique, le mode dev. Impossible de
dire si le problème est réel sans une mesure propre. Aucun lien avec la vidéo :
le hero est en `absolute`.

> Lighthouse ne mesure que le chargement : son 100 ne dit rien du scroll.
> Premier geste : `pnpm build && pnpm start`, puis le CLS de Web Vitals sur un
> vrai scroll à la molette.

---

## 📱 Responsive

### Garde-fou paysage mobile — rendement faible, coût faible

**Position assumée** : le paysage mobile n'est pas un breakpoint standard et ne
mérite pas une troisième mise en page. Le jeu retenu reste 375 / 768 / 1024 /
1440. L'objectif est « pas cassé », pas « conçu pour ».

Sous `@media (orientation: landscape) and (max-height: 500px)` :

- réduire le wordmark du hero (`text-[18vw]` devient énorme quand la hauteur est
  le facteur limitant) ;
- vérifier que le pill `Menu` (bas-centre) et le CTA `Réserver` (haut-droite) ne
  recouvrent pas la tagline ;
- vérifier que les sections `h-screen` (Pourquoi, Carousel) restent lisibles.

---

## 🧱 Dette de code

### Le seul vrai chantier : une porte de visibilité générique

Rien n'éteint aujourd'hui le travail par frame d'une section hors champ : **4
tickers `Marquee`**, **6 couches compositeur** du Carousel, **26 `will-change`
permanents sur 13 fichiers**, le hit-test de `pauseOnHover`. Le backlog a
longtemps traité chacun comme un item isolé — **c'est un seul motif manquant**.

Un helper (`ScrollTrigger.onToggle` vers un drapeau dans un ref, plus
pose/retrait de `will-change`) les réglerait tous d'un coup. Environ une
journée ; touche `Marquee`, `Carousel`, `Hebergements`, `Soir`, `Feedback`.

> ⚠️ **À profiler d'abord.** Corriger le mauvais poste ne changerait rien de
> visible. Les plus lourdes des 26 déclarations ne sont pas celles qu'on croit :
> `Carousel.tsx:336` (piste `w-[375vw]`) et `:384` (5 wrappers plein cadre) —
> six couches promues en permanence pour un pin qui n'occupe qu'une section sur
> treize.

### `Marquee` : le ticker ne s'éteint jamais

`gsap.ticker.add()` tourne pour toute la vie du composant, sans porte de
visibilité. Quatre instances, dont une dans `MenuOverlay` — montée et masquée
toute la session, une écriture de transform par frame sur un `text-[18vw]` que
personne ne voit. Avec `pauseOnHover` (activé par `Cta`), un listener
`mousemove` **et** un listener `scroll` appellent `getBoundingClientRect()` à
chaque événement : un layout forcé par frame pendant un scroll Lenis.

Cas particulier du chantier ci-dessus ; un `IntersectionObserver` règle les deux.

### `SectionHeading.linesCompact` → `SplitText`

Le prop existe parce que le rideau anime **une entrée de `lines`**, pas une
ligne rendue. Coût : une souscription `useMediaQuery`, un tableau de
dépendances porteur, un breakpoint `MQ.belowLg` qui n'existe que pour décrire où
une phrase française passe à la ligne — et **un bug déjà livré** (titre Activités
rendu « Découvrez les » et rien d'autre).

`gsap/SplitText` est présent et libre depuis GSAP 3.13. `new SplitText(h2, {
type: "lines" })` donne un wrapper par ligne **rendue**, re-splittable au resize.
`linesCompact`, `MQ.belowLg` et le `useMediaQuery` disparaissent, et l'effet
devient *plus* correct.

### `AquilonReveal` ⊂ `RevealChars`

Depuis le retrait du prop `mode`, `AquilonReveal` n'est plus que `RevealChars` +
un `clipPath` : même markup, même effet de montage, même branche
reduced-motion, même tween. Différences réelles : `clipPath`, `SLIDE_START_X` 40
au lieu de 110, pas de stagger, texte figé sur `SITE_CONFIG.brandMark`.

**La duplication a déjà coûté** : le correctif de la course de tweens a dû être
appliqué deux fois et ne l'a été qu'une — d'où le wordmark de footer invisible
en production. Fusionner demande de passer `clip` / `slideStartX` en props, et
une vérification visuelle (le dégradé du footer dépend de la structure
`.rc-glyph`), pas un typecheck.

### Contexte d'overlay : séparer actions et état

`createOverlayContext` mémoïse sa valeur mais regroupe `isOpen` avec les trois
callbacks stables. Tous les consommateurs re-rendent donc à chaque bascule — y
compris `Hebergements`, qui ne lit que `open`. Ouvrir le panneau Réserver
re-rend les trois cartes et leurs six `RevealChars`, dont la segmentation par
regex n'est pas mémoïsée. Deux contextes (actions / état) règlent ça.

### `createOverlayContext` : extraire `useOverlayState`

La factory empaquette la machine à états **et** le contexte + hook. `MapOverlay`
a besoin de la première et ne peut pas l'avoir sans le second — d'où ses
`useState`/`useCallback`/`useMemo` recopiés. Sortir `useOverlayState()` en export
séparé (~10 lignes) suffit ; rendre la factory générique coûterait plus cher.

### MenuOverlay / ReservePanel : les valeurs finales écrites trois fois

Les branches reduced-motion réénoncent à la main `top: GAP`, `borderRadius:
RADIUS_OPEN`, `xPercent: 105`… qui existent déjà dans le chemin ouvert et dans
le chemin fermé. Trois copies des mêmes nombres, rien qui les lie. Forme
correcte : une `gsap.timeline({ paused: true })` portant les valeurs une fois,
pilotée par `play()`/`reverse()`, et `progress(isOpen ? 1 : 0).pause()` sous
reduced-motion. La chorégraphie de fermeture est asymétrique, donc c'est un vrai
refactor.

### Migration `.focus-ring` / `.label-caps`

L'offset est désormais une variable (`--focus-ring-offset` sur `:root`), qu'un
conteneur sur une autre surface redéfinit pour son sous-arbre. **La passe est
mécanique** : Header (×3), MapOverlay (×2), ReservePanel (×3), Hebergements,
NavWheelLink, SocialIcons, Proximite (celui-ci en `ring-offset-4`).

`.eyebrow` est renommée **`.label-caps`**. Toujours un seul point d'appel
(`Soir`) : les graphies inline de Hebergements, ReservePanel et Header sont
chacune d'une taille différente — **définir la famille avant d'extraire**.

### Reste du plan de reprise

- **Lot 5** — extraire ce qui reste des primitives partagées.
- **Lot 6** — `src/lib/z-index.ts` (15 valeurs ad-hoc maintenues par
  commentaire), unifier les espacements de section (3 échelles `px-*`
  concurrentes), retirer la graisse 800 jamais utilisée.
- `SITE_DESCRIPTION` dit « Trois refuges », exact côté données mais qui se lit
  comme quatre à l'écran (le hero en montre un, plus les trois d'Hébergements) —
  à trancher.

### Deux détails à coût nul

- `globals.css:69` — `text-rendering: optimizeLegibility` sur `<body>`, alors que
  le document prérendu compte **1 372 `<span>`**. `font-feature-settings:
  "ss01","ss02"` fournit déjà les jeux stylistiques voulus. Suppression d'une
  ligne, aucun effet visuel attendu.
- `Hebergements.tsx:203` anime `borderRadius` en scrub sur un `<article>` plein
  cadre. `border-radius` n'est pas compositable — et le fichier énonce la règle
  **11 lignes plus bas**, appliquée au `backgroundColor` sur la même timeline
  mais pas ici. ⚠️ Le fait est certain, l'ampleur non : à profiler.

---

## 💡 Idées à instruire

### Panorama horizontal épinglé

Une image très large (une capsule vue en entier, ou une scène panoramique),
épinglée pendant que le scroll vertical la fait défiler horizontalement. On
découvre la scène au complet sans jamais la voir d'un coup.

❓ **Point ouvert, et c'est le plus important : image déplacée ou vidéo ?**
Intuition de Patrick : au bout de la ligne ce serait « plus premium » en vidéo.
Les deux ne coûtent pas la même chose, ni à produire ni à charger.

---

## 🔒 Décisions verrouillées — ne pas les rouvrir

| Sujet | Décision | Quand |
|---|---|---|
| Vitesse du rideau | Aucun pin, aucune fenêtre allongée : la cause était `bandLength`. | 2026-09-07 |
| Entrée de la citation | Les lignes montent et se redressent, peintes dans le canvas — **sur 330 px de scroll dès l'entrée dans l'écran, jamais en temps** ; rideau créé au montage, parti où elle finit, **sans amorti ajouté à Lenis**. | 2026-09-08, revue le 2026-09-14 |
| Hero mobile | Rendu actuel jugé parfait ; régénération close sans suite. | 2026-08-30 |
| `next/dynamic` sur les overlays | **Ne vaut pas le coup** — mesuré, voir ci-dessous. | 2026-08-30 |
| Paysage mobile | Pas un breakpoint ; objectif « pas cassé ». | — |
| `pourquoi-crete.avif` | Feuillage mou : limite du modèle atteinte, clos. | — |
| Médaillons de `Soir` | Photos avec du monde restaurées, en connaissance du conflit éditorial. | 2026-08-29 |

### ⛔ `next/dynamic` sur les trois overlays — mesuré, écarté

Le chunk qui les porte fait 44 172 o brut / 12 470 o gz, dont **Lenis seul**
17 722 / 5 055. Les trois overlays pèsent donc ~26 Ko brut, **7,4 Ko gz**. Un
`dynamic()` économiserait 7 Ko gz et ajouterait trois frontières de suspense sur
des composants montés dans le layout racine. Le code applicatif entier du site
fait 28,4 Ko gz — **le JS n'est pas le problème de ce site** : le poids est
React 19 + Next 16 (~162 Ko gz) et GSAP (46 Ko gz).

Angles vérifiés sans rien trouver : gzip actif partout · 2 woff2 variables
(32 Ko) · Zod absent du bundle client · contextes correctement mémoïsés ·
`setRevealActive` par frame retourne `prev` à l'identique donc React bail-out ·
aucun barrel import parasite · pas de data fetching à optimiser.

---

## 🎓 Leçons de méthode — ce que ces erreurs ont coûté

### Une référence se REGARDE avant de se mesurer

Le 2026-09-07, une demi-séance a été passée à mesurer **le mauvais bloc** de
produx.design : celui du footer (« A brand is recognized… »), qui n'a aucune
couleur. Le vrai modèle est « Where intent meets execution, identity takes shape
with confidence and restraint. », plus haut dans la page, et il porte le ruban
lime.

Toutes les conclusions bâties sur le mauvais bloc — dont un parallaxe à 0,506 —
ont dû être jetées.

> ⚠️ **Les captures de la bonne référence étaient déjà dans le dépôt**, à la
> racine puis classées dans `assets-raw/refs/` :
> `produx-rideau-bloc-complet.png`, `produx-rideau-detail-ruban.png`,
> `produx-reference.mp4`, `rideau-pixels.mp4`. **Regarder `assets-raw/refs/`
> AVANT d'aller mesurer un site en ligne.**

### La grandeur qui se compare d'un site à l'autre

Pas un réglage, pas des pixels : **la part de l'encre colorée à un instant
donné**, mesurée sur des captures et classée en trois familles (à lire / ruban /
lu). Elle ne dépend ni de la longueur du texte, ni du nombre de lignes, ni de la
vitesse de scroll. C'est elle qui a montré que notre ruban était deux fois trop
mince là où on cherchait une erreur de vitesse.

### Mesurer en ESPACE DE LECTURE, lignes recollées

La bande du rideau fait plusieurs cadratins et déborde toujours sur la ligne
précédente. Mesurée ligne par ligne, on n'en voit qu'un tiers — **erreur commise
deux fois**, la seconde après l'avoir déjà notée ici.

### Méthode de mesure d'un grade — trois erreurs à ne pas refaire

1. Juger un grade à l'œil sur une capture redimensionnée.
2. Comparer deux images dont l'une a déjà été convertie en AVIF.
3. Mesurer une moyenne globale là où la question portait sur une zone.

### Un mouvement se décompose avant d'être imité

Décrire une animation de mémoire ou d'après des captures fixes produit une
lecture fausse, découverte après avoir bâti dessus. Le 2026-09-07, « entre en
angle » a été lu comme une translation : la référence ne fait rien de tel.

Outillage : `playwright-cli` (`video-start` / `mousewheel` / `video-stop`), puis
`ffmpeg -vf fps=10` pour découper. On n'en garde que des **nombres** — durées,
amplitudes, ordre des gestes.

### Génération d'images — la leçon payée 8 crédits le 2026-08-29

Détaillée dans `docs/assets-a-generer.md`, avec les règles de brief apprises.
Retenir : `--image` verrouille la **silhouette** et le **grade**, jamais
l'**aménagement** — tout ce qui doit être reconnaissable se décrit
explicitement, même si c'est visible dans la référence.

### `will-change` sur un conteneur de canvas le dégrade

La couche GPU rastérise le canvas une fois puis l'étire : les lettres
deviennent franchement pixelisées. Vu immédiatement à l'écran le 2026-09-08.
GSAP pose déjà un `translate3d`, ce qui suffit.

### Une animation EN TEMPS ne précède pas un déclencheur AU SCROLL

Le 2026-09-14, le rideau de la citation « partait trop tard ». L'entrée en
scène se jouait en 1,33 s de temps réel, et le rideau démarrait de la position
du bloc à sa fin : pendant ces 1,33 s la page continuait d'avancer, donc le
départ dépendait de la vitesse de scroll. Mesuré en boîte noire (pixels du
canvas), à 2560×1300 :

| Vitesse | Couleur apparaît — avant → après | Rideau fini — avant → après |
|---|---|---|
| 250 px/s | 63 % → 64 % de la hauteur | 22 % → 33 % |
| 500 px/s | 37 % → 54 % | −3 % → 31 % |
| 1000 px/s | **−11 %** (hors écran) → 35 % | −55 % → 32 % |

Correctif : l'entrée est un tween en pause que le scroll pousse (200 px, vers
l'avant seulement, lissé 0,55 s), et le rideau part de la fin de sa course. Il
reste un décalage au départ : deux lissages de 0,55 s en série.

> ⚠️ **La dernière modification a d'abord été accusée — à tort.** Le symptôme
> est apparu pendant le chantier vidéo du hero. Un A/B mesuré (ancienne et
> nouvelle vidéo, même scroll scripté) a donné un départ identique à 4 px près.
> Mesurer l'A/B AVANT de défaire ce qui vient d'être livré.

**Deuxième passe, le même jour** — Patrick : « elle prend environ une seconde à
se débloquer ». Sa capture montrait la citation grise de 4,9 à 5,7 s, puis une
bascule en UNE image. Trois causes empilées, mesurées une à une :

| Cause | Effet mesuré | Correctif |
|---|---|---|
| Entrée déclenchée à 90 % de la hauteur | 278 ms sans rien après l'entrée dans l'écran | `top bottom` : 14 ms |
| Rideau créé à la FIN de l'entrée | parti de 0, rattrapait le scroll d'un bond | créé au montage |
| `scrub: 0.55` par-dessus Lenis | couleur à 64 % au lieu de 84 % à 500 px/s, 43 % à 1000 | `scrub: true` : 83,5 % aux deux vitesses |

> ⚠️ Un temps mort mesuré EN MOUVEMENT n'est pas forcément dans la géométrie.
> La courbe STATIQUE — scroll posé, attente, pixels comptés en pleine
> résolution — a montré que la couleur démarrait pile à la fin de l'entrée : le
> retard était un amorti, pas un trou. Faire cette courbe avant de toucher aux
> fenêtres.

Le retard retiré, le rideau partait plus tôt qu'avant — ce départ tardif
n'était que l'amorti. La course d'entrée a donc été portée de 200 à **330 px**
(A/B de Patrick) : le rideau retrouve la fenêtre d'avant le correctif, couleur
vers 74 % et fin vers 32 % de la hauteur, sans dépendre de la vitesse.

---

## 📦 Archive — dossiers clos

Gardés pour une ligne chacun, parce qu'ils répondent à une question qui revient.

| Dossier | Issue |
|---|---|
| Canon du refuge | Établi et appliqué ; le canon fait foi dans `assets-a-generer.md`. |
| `refuge-galets.avif` | Forme différente des deux autres — **voulu**, pour que la gamme ne soit pas trois fois le même objet. |
| `activites/pierres-debout.avif` | Remplace les bélugas ; Hopewell assumé. |
| Carousel carte 4 | « Terrasse en fête » remplacée par « Les pierres debout ». |
| Médaillons de `Soir` | Rideau retiré, anciennes photos remises. |
| Art direction hero portrait | Livrée ; `<picture>` + `<source media>`, preload dédoublé. |
| Cartes `Hebergements` en portrait | Livrées le 2026-08-30. |
| Vidéo hero desktop floue | Soldée le 2026-09-14 : **upscalée** depuis la sortie native (`bytedance_video_upscale` pro), pas regénérée. Leçon dans `assets-a-generer.md`. |
| Vidéo hero : 6 Mo pour tous les écrans | Deux largeurs le 2026-09-14 — 2160 px (3,5 Mo) tant que largeur × DPR × 1,1 ≤ 2160, 2880 au-delà ; choix dans `Hero.tsx`. |
| Lisibilité des cartes Hébergements | Mesurée — **l'hypothèse de départ était fausse**. |
| État caché en CSS | Fait ; la règle est dans `docs/reduced-motion.md`. |
| Révélation dépendante de la direction | Corrigée (zone morte de 0,03). |
| Passe copy complète | Faite. |
| `unoptimized` sur les `<Image>` | Tranché : s'applique à tous les raster. |
| `_raw/` hors de `public/` | Fait — `/assets-raw/`, gitignoré. |
