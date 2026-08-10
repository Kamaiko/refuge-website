# Backlog — Aquilon

> Tâches identifiées et volontairement reportées. Chaque entrée dit **pourquoi** elle attend, pour qu'on puisse la reprendre sans re-instruire le contexte.

---

## 🎨 Assets

### ✅ Traités — canon du refuge

Le **canon** ci-dessous est la référence de tout refuge représenté sur le site. Il est appliqué dans `pourquoi-aube.avif` et `refuge-galets.avif`, et l'image source est `_raw/refs/canon-capsule.jpg`.

> **Règle apprise** : `--image` verrouille la **silhouette** et le **grade**, jamais l'**aménagement**. Une première version décrivait la coque et le paysage sans un mot sur l'intérieur — le modèle l'a inventé, et le résultat était plausible mais hors concept. Tout ce qui doit être reconnaissable se décrit explicitement, même si c'est visible dans la référence.

**Canon du refuge** :
- Coque **stadium** : pill horizontal, deux bouts entièrement arrondis, bois carbonisé noir mat
- Façade longue entièrement vitrée, panneaux hauts à châssis noirs fins, porte coulissante au centre
- Intérieur : voûte continue **beige avoine** épousant la forme du pill — aucun angle visible ; plancher en bois blond clair
- **Gauche** : lit plateforme bas, literie ivoire, petite table de chevet en bois, lampe de lecture noire articulée
- **Centre** : kitchenette compacte, façades bois pâle, robinet col-de-cygne noir, planche à découper en bois appuyée, **suspension globe ambre/laiton** au-dessus
- **Droite** : poêle à bois noir avec conduit noir traversant le toit, bûches fendues empilées à côté, fauteuil bouclé crème, guéridon rond
- Terrasse : lames de bois clair, **bain nordique en douves de bois**, coussins de sol, bougies piliers dans des photophores noirs, une lanterne

**Commande** (Pro obligatoire — ne pas utiliser un modèle lite, la fidélité architecturale est tout l'enjeu) :

```bash
higgsfield generate create nano_banana_2 --aspect_ratio 4:5 --resolution 4k \
  --image public/images/_raw/refs/canon-capsule.jpg --wait --prompt "…"
```

> `_raw/refs/` garde les images de référence à repasser en `--image` :
> `canon-capsule.jpg` (silhouette + aménagement canoniques, dérivée du hero) et
> `canon-terrasse-allumee.png`. Passer un JPEG ou un PNG, **jamais un AVIF** —
> l'upload échoue.

Prompt de `pourquoi-aube` (le bloc « THE INTERIOR MUST MATCH THIS EXACTLY » est
la partie load-bearing ; le reprendre tel quel pour tout nouveau plan de refuge) :
```
Dawn in Charlevoix, Quebec, twenty minutes before sunrise. A single capsule cabin
identical to the reference image: a horizontal stadium/pill silhouette with both ends
fully rounded, matte charred-black Shou Sugi Ban outer shell, and one entire long side
glazed floor to ceiling in tall slim black-framed panels with a sliding door at the
centre. Seen from a three-quarter FRONT angle so the glazed side faces the camera and
the interior is clearly visible, glowing warm amber.

THE INTERIOR MUST MATCH THIS EXACTLY, read left to right through the glass: the walls
and ceiling are one continuous pale oatmeal-beige curved vault following the pill shape,
with no visible corners, over a pale blond timber floor. On the LEFT, a low platform bed
with ivory linen bedding, a small wooden nightstand and a black articulated reading lamp.
In the CENTRE, a compact kitchenette with pale wood cabinet fronts, a black gooseneck tap
and a wooden chopping board, lit by a single amber glass globe pendant hanging above it.
On the RIGHT, a black cast-iron wood stove with a black flue pipe rising through the roof,
split firewood stacked beside it, a cream bouclé armchair and a small round side table.

The cabin stands on a wide pale timber deck holding a round wooden barrel hot tub with
steam rising, two floor cushions and three pillar candles in black holders. It sits high
on an OPEN rocky bluff, not enclosed by forest: beyond and far below, a vast view over the
St. Lawrence fjord, turquoise water under a thick low fog layer, dark mountain ridges
receding under a pale pink and cream pre-dawn sky. Birches and red maples frame only the
outer left and right edges. NO people. Natural colour grade, NOT HDR, NOT CGI-looking,
crisp sharp detail throughout, no soft painterly foliage. 35mm lens, architectural
editorial photography. No signage, no logos, no text. Vertical 4:5 composition.
```

### `pourquoi-crete.avif` — feuillage mou : limite atteinte, clos

**Constat initial** : forêt de mi-distance floue, sans micro-contraste — l'artefact de diffusion qui signale « image générée » à l'œil entraîné.

**Deux pistes essayées, résultats mesurés sur recadrage 1:1** :

1. **Régénération avec consignes de netteté** (`crisp individual tree crowns`, `high micro-contrast in the canopy`, `DEEP FOCUS, no shallow depth of field`, `must read as a real drone photograph`) → gain réel mais modeste : meilleure séparation des couleurs et de la structure d'ensemble, feuillage toujours mou au pixel.
2. **`topaz_image`, modèle High Fidelity V2**, 3712×4608 → 5568×6912, `sharpen 0.3` → **aucun gain perceptible**. Recadrage identique à l'entrée.

**Conclusion** : la mollesse est **générative, pas un déficit de résolution**. Un upscaler ne peut pas inventer une structure absente de l'image source. Aucun outil disponible ne récupérera ce détail — inutile d'y redépenser.

**Décision** : v4 retenue (meilleure que v3 en structure), avec un léger masque flou appliqué **au redimensionnement**, ce qui est gratuit et rend le piqué perçu :

```bash
ffmpeg -y -i src.png -vf "scale=1600:-2,unsharp=5:5:0.55:5:5:0.0" \
  -c:v libaom-av1 -still-picture 1 -cpu-used 6 -crf 30 -pix_fmt yuv420p out.avif
```

À la taille d'affichage réelle (~700 px de large dans la carte), le défaut ne se voit pas ; le recadrage qui le révélait était un agrandissement ×2 que personne ne verra.

**Note d'API** — le paramètre `input_image` de `topaz_image` n'accepte ni un chemin ni un id nu, mais un objet :
```bash
higgsfield upload create ./image.png        # → <upload_id>
higgsfield generate create topaz_image \
  --input_image '{"type":"media_input","id":"<upload_id>"}' \
  --model "High Fidelity V2" --output_width W --output_height H --wait
```
(le shell bash gère mieux ces guillemets que PowerShell)

### ✅ Médaillons — les deux paires sont en place

`medaillon-{feu,terrasse}-{eteint,allume}`. Les deux rideaux tournent.

Le duo est construit pour se répondre : le **feu commun**, vu d'en bas, et la **terrasse privée** d'où on le regarde — la lueur du feu est visible comme un point orange au loin dans les arbres de la seconde image, et disparaît dans sa version éteinte. C'est exactement le body copy : « Certains descendent. D'autres regardent la lueur depuis leur terrasse. »

**Règles de brief apprises sur ce lot** — coûteuses à redécouvrir :
- **Nommer les objets un par un et les compter** (« one hurricane lantern, one low stool with one closed book, one ceramic mug ») ; écrire « des lanternes » produit une rangée de quatorze qui lit comme une installation de mariage.
- **Lister les exclusions explicitement** (« no blankets, no cushions, no additional lanterns, no plants ») et **exiger le vide** (« at least half the frame is bare deck »).
- **Pas de figures humaines.** Deux dos anonymes ne portent rien ; la trace humaine dans les objets (un livre posé, une tasse) est plus forte et ne peut pas rater.
- **Ne pas demander le refuge s'il n'est pas le sujet** — les modèles produisent une architecture générique qui ne ressemble pas à la capsule stadium. Les deux médaillons n'en contiennent aucun et n'en souffrent pas.
- La couverture de laine est déjà employée dans `medaillon-feu-allume` : ne pas la répéter.

Variantes écartées, conservées dans `_raw/alternates/` : `medaillon-table-avec-personnes`, `medaillon-feu-avec-personnes`, `medaillon-feu-jour-midi`, `medaillon-sentier-trop-de-lanternes`.

### ✅ `refuge-galets.avif` — doublon corrigé
Le fichier était **octet pour octet identique à `hero-shape.avif`** : le troisième refuge affichait la photo du hero. Régénéré d'après sa description dans `src/lib/data/refuges.ts` — rivage rocheux à marée basse, étendue de galets, flaques de marée, cargo à l'horizon, bain nordique sur la terrasse, lumière rasante de fin d'après-midi. MD5 vérifié différent après coup.

### Carousel carte 4 « Terrasse en fête » — à remplacer par une autre activité

**Constat** : le concept plaît, mais il s'éloigne trop de l'environnement paisible du projet. La fête n'est pas l'attrait numéro un — et sur `activite-terrasse.avif` tout le monde est habillé proprement, ce qui tire vers l'événementiel plutôt que vers le territoire. C'est le dernier vestige du registre « festival » qu'on a retiré partout ailleurs.

**Contrainte de créneau** : la carte occupe le slot « Après-midi » entre trois activités de plein effort (kayak, sommets, via ferrata) et « Le feu de minuit ». Il lui faut donc un registre **calme**, distinct des trois premières, et qui ne double pas la veillée.

**Pistes, par ordre de préférence** :

1. **Observation des bélugas** ⭐ — le plus « Charlevoix » de tous, et déjà semé dans le copy : la description du refuge Galets dit « Les bélugas passent l'été, parfois ». Contemplatif par nature, aucun recoupement avec les autres cartes. Depuis la rive ou en zodiac.
   *Piste de copy* : « On attend. C'est tout le principe. Parfois ils passent. »
2. **Cueillette en forêt** — champignons et petits fruits d'automne. Tactile, lent, très régional, et c'est la seule carte qui ferait baisser le regard au lieu de le porter au loin.
3. **Route des saveurs** — passer chez un producteur, rapporter de quoi souper. Garde une note humaine et chaleureuse sans aucune foule.

**À faire une fois l'idée arrêtée** : régénérer `activite-terrasse.avif` (3:2, ≤ 2 personnes ou aucune, palette stricte), et réécrire le titre, le sous-titre et le niveau dans `CARDS` — les données sont **hardcodées dans `Carousel.tsx`**, pas dans `src/lib/data`.

### Encore jamais produits
- `lieu-charlevoix.avif` (4:5) — section `Lieu.tsx`, non implémentée
- Galerie ambiance, 6 images — section `Galerie.tsx`, non implémentée
- Vidéos d'ambiance (brume, feuille, eau) ; `hero-loop.mp4` existe

---

## 📱 Responsive — le vrai sujet n'est pas le paysage

### Art direction du hero en portrait (rendement élevé)
**Constat** : `hero-shape.avif` est cadrée en ~16:9. Le hero est `h-[100svh]` avec `object-cover`. Sur un téléphone en portrait (9:19.5), le navigateur ne garde qu'une bande verticale centrale et jette environ deux tiers de l'image. D'où l'impression de « tout est cropped » quand le site est montré sur mobile.

**Action** : produire une variante portrait du hero (4:5 ou 3:4) et la servir sous `md` via `<picture>` + deux `<source media="...">`. Les images `pourquoi-*` sont la preuve que le format tient : elles sont en 4:5 et se lisent parfaitement sur téléphone.

Même question à poser pour les cartes de `Hebergements` (`refuge-*.avif`, toutes en 16:9).

### Garde-fou paysage mobile (rendement faible, coût faible)
**Position assumée** : le paysage mobile n'est **pas** un breakpoint standard et ne mérite pas une troisième mise en page. Le jeu retenu reste 375 / 768 / 1024 / 1440.

Mais il faut éviter le « cassé ». Sous `@media (orientation: landscape) and (max-height: 500px)` :
- réduire le wordmark du hero (`text-[18vw]` devient énorme quand la hauteur est le facteur limitant)
- vérifier que le pill `Menu` (bottom-center) et le CTA `Réserver` (top-right) ne recouvrent pas la tagline
- vérifier que les sections `h-screen` (Pourquoi, Carousel) restent lisibles

Objectif : « pas cassé », pas « conçu pour ».

---

## 🧱 Code — reste du plan de reprise

- **Lot 1.4** — passe copy complète sur les 13 sections + overlays. Blocs déjà repérés comme décrochant : le `SUBCOPY` du Hero (« temps de qualité », « nos emplacements », et un `avec — X` calqué de l'anglais), le témoignage Feedback (« a redéfini ce que repos veut dire »), le paragraphe Activités (il explique la dualité juste avant un carrousel qui la montre), la carte « Terrasse en fête ».
- **Lot 5** — extraire `<SectionHeading>` (Choisir ↔ Activités ↔ Cta partagent ~125 lignes dont 28 identiques octet pour octet), `createOverlayContext()` (3 contextes quasi jumeaux), `useOverlayA11y()` (Escape + focus save/restore écrits 3 fois).
- **Lot 6** — `src/lib/z-index.ts` (15 valeurs ad-hoc maintenues par commentaire), unifier les espacements de section (3 échelles `px-*` concurrentes), trancher sur `unoptimized` (posé sur 8 `<Image>` sur 14, dont le LCP, mais pas sur Medaillons/ReservePanel/Feedback qui servent les mêmes AVIF), sortir `public/images/_raw/` (588 Mo) de `public/`, dé-tracker `docs/hero-aquilon.png` (5,5 Mo), retirer la graisse 800 jamais utilisée.
- **Perf** — `Feedback.tsx` anime `filter: blur` en scrub sur ~50 spans, chacun promu en couche compositeur. Poste le plus lourd du site ; mesurer, et remplacer par `opacity` + `y` si le coût se confirme.

---

## ⚙️ Fonctionnel

- **Réservations non envoyées** — `src/actions/reservation.ts` valide en Zod et retourne un message de succès, mais l'intégration Resend n'a jamais été branchée. Le formulaire ment à l'utilisateur.
- **Ancres orphelines** — `#choisir`, `#proximite` et `#cta` sont déclarées sur les sections mais absentes de `src/lib/data/nav.ts`.
- **Sections planifiées jamais implémentées** — `Lieu.tsx` et `Galerie.tsx` (référencées dans CLAUDE.md et `assets-a-generer.md`).
