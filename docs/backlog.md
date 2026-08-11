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

### `hero-loop.mp4` (desktop) — à regénérer entièrement

La source est médiocre au départ : plan mou, boucle qui reprend mal. Elle a
été recousue et ré-encodée en attendant, mais on ne répare pas un plan faible
en post — il faut une nouvelle génération.

**Ce qui a été fait en attendant** : fondu de queue sur tête de 2,0 s (7,08 s
→ 5,08 s), ré-encodage `crf 19`. L'original tournait à 4 840 kbps pour un plan
lent, soit 4,1 Mo sur le chemin critique du hero ; on est à 2,2 Mo pour une
perte de netteté de 1,9 % contre la source. ⚠️ Un premier passage en `crf 23`
coûtait 6,5 % — mesuré, pas estimé. Ne pas redescendre.

**Aucune source n'existe** dans `assets-raw/finals/` pour l'original : seule
la version recousue est archivée (`hero-loop-desktop-src-7s.mp4`, qui est en
fait le fichier livré avant ma passe). Une régénération à l'identique est donc
impossible de toute façon.

**Consignes pour la nouvelle** :
- **Caméra verrouillée.** Aucun mouvement d'appareil. C'est ce qui rend le
  fondu de bouclage invisible, et ça divise le poids par trois : la portrait,
  en plan fixe, tient dans 800 Ko contre 2,2 Mo pour la desktop.
- **Aucun modèle ne boucle**, quoi qu'on lui écrive — il produit N secondes et
  s'arrête où il en est. Le bouclage se fait toujours en post.
- Mouvement d'ambiance seulement : brume qui dérive, feuillage qui frémit,
  vapeur du bain nordique, lueur intérieure **stable** (pas de scintillement).
- Cadrage : gros plan de la capsule, intérieur lisible — voir la section
  « Art direction du hero en portrait » pour le détail des consignes.

### Encore jamais produits
- `lieu-charlevoix.avif` (4:5) — section `Lieu.tsx`, non implémentée
- Galerie ambiance, 6 images — section `Galerie.tsx`, non implémentée
- Vidéos d'ambiance (brume, feuille, eau)

---

## 📱 Responsive — le vrai sujet n'est pas le paysage

### ✅ Art direction du hero en portrait — livré, mais l'image est à refaire

Le format est réglé : source 9:16 servie sous `md` par un `<picture>`, vidéo
choisie en JS, deux `<link rel="preload">` avec `media`. Vérifié à 390×844 —
seuls les fichiers portrait sont téléchargés. **Ce qui reste à refaire, c'est
la photo elle-même**, au prochain rechargement de crédits.

**Le défaut à corriger : ce n'est pas le même PLAN que le desktop.**
`hero-shape.avif` est un **gros plan** — la capsule occupe la moitié du cadre
et l'intérieur (lit, cuisine, poêle, suspension ambre) se lit en détail. Le
portrait actuel est un **plan large** où la capsule fait ~30 % de la largeur.
C'est la cause racine de tout ce qui a été reproché ensuite : un plan large
donne beaucoup de ciel, donc une image pâle, donc une envie de la corriger au
grade — alors que le problème était le cadrage.

**Consignes pour la prochaine génération** (payées, à ne pas redécouvrir) :

1. **Gros plan. C'est la consigne n°1.** Demander explicitement que la capsule
   remplisse la majeure partie du cadre et que l'intérieur soit lisible en
   détail. Le hero vend l'architecture, pas le paysage.
2. **Générer depuis la source d'origine** (`assets-raw/misc/hero-aquilon.png`),
   pas depuis un rendu déjà généré. « Keep everything, change only X » ne sait
   corriger qu'un défaut **localisé** — retirer un objet, nettoyer un coin. Le
   cadrage fait partie du « everything » qu'on demande de préserver : les deux
   consignes se contredisent et la préservation gagne. Essayé, mesuré : la
   capsule est passée de 25 % à 30 % de largeur, et la consigne « plus sombre »
   a été ignorée (Y 161,9 → 161,1).
3. **Composer en trois bandes** — ça, ça a marché et il faut le garder. Tiers
   haut vide (le wordmark `text-[18vw]` s'y pose), bande centrale pour la
   capsule, tiers bas calme (tagline + subcopy). Vérifié à 390×844 : ni la
   pastille `Réserver` ni le `Menu` ne mordent sur l'architecture.
4. **Nommer la palette par la valeur ET par la teinte, séparément.** Les
   adjectifs de chaleur pilotent la saturation plus que l'image de référence,
   et **le texte l'emporte toujours sur `--image`**. Mais retirer tous les
   adjectifs donne une image plate : « désaturé » et « plat » sont deux
   réglages différents.
5. **Cibles chiffrées à viser**, mesurées sur `hero-shape.avif` (voir plus bas
   la méthode) : ciel `rgb(237,220,209)`, `V/R 0,928`, `B/R 0,882` — un tan
   crème chaud, **surtout pas mauve**. Intérieur `rgb(142,88,61)`, `V/R 0,620`,
   `B/R 0,430` — de l'ambre, pas du rouge. Point noir `YLOW ≈ 24`.

**Grade appliqué en attendant** (dans `assets-raw/finals/hero-portrait-GRADE.txt`,
à réappliquer à l'identique au poster ET à la vidéo, sinon le fondu
poster → vidéo fait un saut de couleur) :

```
curves=all='0/0 0.25/0.11 0.5/0.34 0.75/0.65 1/0.99',
curves=b='0/0 0.5/0.38 1/0.88',
curves=g='0/0 0.5/0.487 1/0.975'
```

### Méthode de mesure d'un grade — trois erreurs commises, à ne pas refaire

1. **`sqrt((U_moyen−128)² + (V_moyen−128)²)` ne mesure pas la saturation.**
   C'est la saturation *de la moyenne*, donc une **dominante de couleur**. Sur
   cette métrique le portrait paraissait 35 % moins coloré que le paysage ;
   sur la bonne (`signalstats` `SATAVG`, moyenne des saturations par pixel) il
   était **plus** coloré. J'ai poussé `eq=saturation` à 1,70 sur une image qui
   n'en manquait pas — résultat douloureux à l'œil.
2. **`eq=saturation` est presque toujours le mauvais outil.** Il multiplie
   tout, donc il pousse au néon ce qui est déjà saturé (les érables rouges) et
   ne fait presque rien sur ce qui est neutre (le ciel pâle). Si un jour il
   faut vraiment monter la couleur, c'est `vibrance` — il fait l'inverse.
3. **Une image pâle manque souvent de point noir, pas de couleur.** Le portrait
   avait un plancher d'ombres à 61 contre 24 pour le paysage. Une courbe qui
   descend le bas en gardant le point blanc suffit : la couleur déjà présente
   ressort seule. Et une correction de **teinte** par canal (`curves=b`,
   `curves=g`) règle un ciel mauve ou un intérieur rouge, là où saturation et
   gamma ne peuvent rien.

Commande de mesure d'une zone (moyenne exacte, pas d'estimation à l'œil) :
```bash
ffmpeg -v error -i img.avif -vf "crop=iw:ih*0.18:0:0,scale=1:1" \
  -f rawvideo -pix_fmt rgb24 - | od -An -tu1
```

### Cartes `Hebergements` en portrait — même sujet
Les `refuges/*.avif` sont toutes en 16:9 et les cartes sont `absolute inset-0`
dans un conteneur `~100lvh` : même crop que le hero avant correction. Un
portrait 9:16 par refuge, servi par le même `<picture>`. Ajouter un champ
`imagePortrait` à `src/lib/data/refuges.ts`.

⚠️ Contrainte propre à ces cartes : le surnom et le nom sont typographiés
**en bas à gauche**. Demander explicitement que le tiers bas, moitié gauche,
reste sombre et sans détail clair. Testé sur une première passe de `brume` :
la consigne est respectée, et ça travaille directement pour la lisibilité du
surnom (voir la section « Lisibilité »). Mais **même piège que le hero** —
la première passe a produit un plan large avec la capsule au loin, et a
inventé un précipice absent de la photo d'origine. Exiger le gros plan et
l'intérieur lisible, et interdire tout élément de terrain non présent dans
la référence.

### Garde-fou paysage mobile (rendement faible, coût faible)
**Position assumée** : le paysage mobile n'est **pas** un breakpoint standard et ne mérite pas une troisième mise en page. Le jeu retenu reste 375 / 768 / 1024 / 1440.

Mais il faut éviter le « cassé ». Sous `@media (orientation: landscape) and (max-height: 500px)` :
- réduire le wordmark du hero (`text-[18vw]` devient énorme quand la hauteur est le facteur limitant)
- vérifier que le pill `Menu` (bottom-center) et le CTA `Réserver` (top-right) ne recouvrent pas la tagline
- vérifier que les sections `h-screen` (Pourquoi, Carousel) restent lisibles

Objectif : « pas cassé », pas « conçu pour ».

---

## 🧱 Code — issus de la revue

### Carousel : reduced-motion sur desktop avec souris
Sous `prefers-reduced-motion`, le Carousel bascule sur la piste mobile — un
scroll horizontal `snap-x` — à toutes les largeurs. Ça règle le cas tactile,
mais sur un desktop à la souris cette piste est difficile d'accès : sa barre
de défilement est masquée deux fois (`.no-scrollbar` et le `scrollbar-width:
none !important` global de `globals.css`), et elle n'est pas focusable.

Le correctif propre n'est pas un ajustement : il faut une mise en page
verticale empilée pour ce cas, ou rendre la piste focusable avec des
contrôles visibles. C'est un vrai trou, mais étroit — reduced-motion **et**
desktop **et** souris.

### ~~`.focus-ring` et `.eyebrow`~~ — débloqué, migration à faire
`.focus-ring` n'avait qu'un point d'appel, et la raison n'était **pas** la
paresse : la classe figeait `ring-offset-base-noir`, alors que la moitié des
anneaux inline restants sont sur gris-tan (ReservePanel, SocialIcons). Elle ne
pouvait littéralement pas les absorber. L'offset est maintenant une variable
(`--focus-ring-offset`, définie sur `:root`), qu'un conteneur sur une autre
surface redéfinit pour son sous-arbre. **La passe est désormais mécanique** :
Header (×3), MapOverlay (×2), ReservePanel (×3), Hebergements, NavWheelLink,
SocialIcons, Proximite (celui-ci en `ring-offset-4`).

`.eyebrow` est renommée **`.label-caps`** : `SectionHeading` a un prop
`eyebrow` qui rend `text-xl md:text-2xl font-semibold` — un mot, deux sens, et
la classe ne s'appliquait même pas au composant qui possédait le mot. Toujours
un seul point d'appel (`Soir`) : les spellings inline de Hebergements,
ReservePanel et Header sont chacun d'une taille différente, donc ils ne
forment pas encore une famille. Définir la famille avant d'extraire.

### ~~Révélation du texte dépendante de la direction~~ — corrigé
`Hebergements` lisait `self.direction` pour choisir son seuil, et plaçait le
seuil de masquage **au-dessus** de celui de révélation : entre les deux, l'état
basculait à chaque changement de direction — exactement le scintillement que le
commentaire prétendait empêcher. Les deux seuils sont maintenant lus de la même
façon dans les deux sens, avec une zone morte de 0,03. L'état au repos ne
dépend plus du chemin parcouru, et les points de snap ont pu redescendre là où
les cartes arrivent vraiment.

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

---

## 🎨 Lisibilité — surnom des cartes Hébergements

Le **petit titre** de chaque carte (le `surnom`, `text-creme-dim` sur le
`RevealChars` du haut) manque de contraste sur une des trois photos. Verdict
utilisateur, en observation directe :

| Carte | Surnom | Lisibilité |
|---|---|---|
| Brume | « Au creux de la forêt » | parfait |
| Aubépine | — | passe |
| **Galets** | — | **difficile à lire** |

Le reste du contenu (nom, description, capacité) est lisible sur les trois.
C'est donc un problème de **ce niveau typographique précis** — 12 px,
`tracking-[0.3em]`, `creme-dim` (#C9C5BD) — posé sur la zone la plus claire
d'une photo, pas un problème général de la carte.

Pistes, de la moins à la plus invasive :

1. **Renforcer le dégradé radial de la carte** sous ce coin uniquement. Il
   existe déjà (`radial-gradient(ellipse 90% 65% at 0% 100%…)`) mais il est
   ancré en bas à gauche, alors que le surnom est plus haut. Le plus ciblé.
2. **Passer le surnom en `creme`** plein plutôt que `creme-dim`. Une ligne,
   mais ça aplatit la hiérarchie surnom → nom sur les trois cartes.
3. **Regénérer `refuge-galets.avif`** avec une zone basse plus sombre. Coûte
   des crédits et rouvre l'art direction d'une image déjà validée.

⚠️ Ne pas trancher au jugé : mesurer le ratio de contraste réel sous le texte
sur les trois cartes avant de choisir. La différence perçue entre « passe » et
« difficile » est peut-être un écart de 0,3 de ratio, auquel cas la piste 1
suffit et ne touche à rien d'autre.

## 🧱 Code — reports assumés de la passe simplify

Trouvés par la revue, **volontairement pas corrigés** dans cette passe parce
que chacun est un vrai refactor et non un ajustement. Consignés avec le
raisonnement pour ne pas les redécouvrir.

### L'état caché devrait vivre en CSS, pas en JS (le plus rentable)
Beaucoup d'éléments sont livrés cachés par le markup SSR (`opacity: 0`,
`visibility: hidden`, `clip-path: inset(100%)`) et **seul JS défait ça**.
Chaque branche `prefers-reduced-motion: reduce` — il y en a six — ne fait
qu'annuler à la main l'état caché posé quelques lignes plus haut.

Les deux moitiés de l'invariant sont écrites dans deux langages, dans deux
fichiers. `AquilonReveal` a déjà **perdu** cette course en production : la
préférence lit `false` au rendu d'hydratation, un tween de masquage part, et
la branche `reduce` arrive trop tard. `RevealChars` la gagne aujourd'hui *par
chance de timing* — son propre commentaire le dit.

Forme correcte : mettre l'état caché derrière la media query, en CSS.

```css
@media (prefers-reduced-motion: no-preference) {
  [data-anim="fade"]    { opacity: 0; }
  [data-anim="curtain"] { visibility: hidden; }
}
```

Le JSX porte `data-anim` au lieu d'un style inline, et chaque branche `reduce`
se réduit à « ne pas animer ». La course disparaît structurellement : le CSS
s'applique dès la première peinture serveur.

⚠️ Un helper `restAt(targets, props)` **ne marcherait pas** : les états de
repos sont réellement spécifiques. Ce qui est partagé, c'est l'état *caché*.

### `SectionHeading.linesCompact` → SplitText
Le prop existe parce que le rideau anime **une entrée de `lines`**, pas une
ligne rendue. Coût : une souscription `useMediaQuery`, un tableau de
dépendances porteur, un breakpoint `MQ.belowLg` qui n'existe que pour décrire
où une phrase française passe à la ligne — et un bug déjà livré (le titre
Activités rendu « Découvrez les » et rien d'autre).

`gsap/SplitText` est présent dans `node_modules` et libre depuis GSAP 3.13.
`new SplitText(h2, { type: "lines" })` donne un wrapper par ligne **rendue**,
re-splittable au resize. `linesCompact`, `MQ.belowLg` et le `useMediaQuery` du
composant disparaissent, et l'effet devient *plus* correct — aujourd'hui il se
dé-stagge à toute largeur où une entrée se replie sans qu'on l'ait mesurée.

### MenuOverlay / ReservePanel : les valeurs finales écrites trois fois
Les branches reduced-motion réénoncent à la main `top: GAP`, `borderRadius:
RADIUS_OPEN`, `xPercent: 105`… qui existent déjà dans le chemin ouvert et dans
le chemin fermé. Trois copies des mêmes nombres, rien qui les lie.

Forme correcte : une `gsap.timeline({paused: true})` qui porte les valeurs une
fois, pilotée par `tl.play()` / `tl.reverse()`, et `tl.progress(isOpen ? 1 : 0)
.pause()` sous reduced-motion. La chorégraphie de fermeture est asymétrique
(durées et eases par élément), donc c'est un vrai refactor.

### `createOverlayContext` : extraire `useOverlayState`
La factory empaquette la machine à états open/close **et** le contexte + hook.
`MapOverlay` a besoin de la première et ne peut pas l'avoir, parce qu'elle
n'est atteignable qu'à travers le second — d'où ses `useState`/`useCallback`/
`useMemo` recopiés. Sortir `useOverlayState()` en export séparé (≈10 lignes)
règle ça sans rendre la factory générique, ce qui coûterait plus cher.

### `AquilonReveal` ⊂ `RevealChars`
Depuis le retrait du prop `mode`, `AquilonReveal` n'est plus que `RevealChars`
+ un `clipPath` : même markup `.rc-glyph`, même effet de montage, même branche
reduced-motion au commentaire près, même tween. Différences réelles :
`clipPath`, `SLIDE_START_X` 40 au lieu de 110, pas de stagger, texte figé sur
`SITE_CONFIG.brandMark`.

La duplication a **déjà coûté** : le correctif de la course de tweens a dû
être appliqué deux fois, et ne l'a été qu'une seule au premier passage — d'où
le wordmark de footer invisible. Fusionner demande de passer `clip` /
`slideStartX` en props. Pas fait ici parce que le dégradé du footer dépend de
la structure `.rc-glyph` et mérite une vérification visuelle, pas un typecheck.

### Contexte d'overlay : séparer actions et état
`createOverlayContext` mémoïse bien sa valeur, mais regroupe `isOpen` avec les
trois callbacks stables. Tous les consommateurs re-rendent donc à chaque
bascule — y compris `Hebergements`, qui ne lit que `open`. Ouvrir le panneau
Réserver re-rend les trois cartes et leurs six `RevealChars`, dont la
segmentation par regex n'est pas mémoïsée. Deux contextes (actions constantes /
état) règlent ça.

### `will-change` permanents
Quatre déclarations posées dans le JSX, donc actives pour toute la durée de vie
de la page, alors que la propriété n'est animée que pendant la traversée d'une
section : `Hebergements` (calque plein écran en `opacity`), `Soir` (deux
rideaux en `clip-path`, colonne de texte en `transform`). Le correctif propre
demande de poser/retirer le hint autour de l'animation — pas trivial sur un
ScrollTrigger scrubbé, qui n'a pas de `onStart`/`onComplete` significatifs.

### `Marquee` : le ticker ne s'éteint jamais
`gsap.ticker.add()` tourne pour toute la durée de vie du composant, sans porte
de visibilité. Quatre instances sur la page, dont une dans `MenuOverlay` —
montée et masquée toute la session, une écriture de transform par frame sur un
`text-[18vw]` que personne ne peut voir. Avec `pauseOnHover` (activé par
`Cta`), un listener `mousemove` **et** un listener `scroll` appellent
`getBoundingClientRect()` à chaque événement : un layout forcé par frame
pendant un scroll Lenis. Un `IntersectionObserver` réglerait les deux.

## 🎨 `activites/belugas.avif` — regénérer, palette hors design system

Carte 4 du Carousel, « Le passage des bélugas »
([Carousel.tsx:81](../src/components/sections/Carousel.tsx#L81)).

**Problème** : coucher de soleil trop orange et trop saturé. Les couchers de
soleil du reste du site ne le sont pas — `pourquoi/crete.avif`, `pourquoi/
aube.avif` et `refuges/galets.avif` tiennent tous dans une lumière basse,
désaturée, plus terre que feu. Cette image tire vers l'orange publicitaire et
ne tient pas dans la bande chaude gris-tan qui la porte.

⚠️ **La cause est très probablement dans mes propres adjectifs.** C'est la
règle apprise à ses dépens sur `refuge-galets` : les qualificatifs pilotent la
saturation bien plus que la référence. « blazing », « burnt », « fiery », «
golden hour » la montent ; « muted », « faded », « overcast », « past peak »,
« low contrast » la descendent. Et **en cas de conflit, le texte l'emporte sur
l'image de référence.**

**Méthode pour la reprise :**

1. Ne PAS décrire le grade en mots. Passer `pourquoi/crete.avif` (ou l'AVIF
   converti en PNG — `--image` n'accepte pas l'AVIF) en référence et demander
   explicitement d'en reproduire la palette et le niveau de saturation.
2. Retirer du prompt tout adjectif de chaleur. Si une heure doit être nommée,
   dire « late afternoon, overcast, low sun behind cloud » plutôt que « golden
   hour » ou « sunset ».
3. **Ne pas perdre l'acquis** : la version précédente avait été refaite parce
   qu'on ne voyait pas les bélugas. Les garder proches, lisibles, et l'eau
   sombre — c'est ce qui les détache. Le risque de cette passe est de
   désaturer jusqu'à les rendre invisibles à nouveau.
4. Regénération complète depuis zéro, pas une retouche à partir de l'image
   actuelle : chaque itération qui repart d'un rendu perd en netteté.
