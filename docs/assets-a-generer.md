# Assets — Refuges Aquilon

> État des assets visuels. Les **sources** des images live sont archivées dans
> **`/assets-raw/`** à la racine du dépôt — hors de `public/`, gitignoré, voir
> `assets-raw/_INDEX.md`. ⚠️ Elles ont vécu dans `public/images/_raw/` jusqu'en
> août 2026 : gitignorées, mais tout de même servies par `next dev` et copiées
> par tout build local (1,25 Go). Les chemins `_raw/…` qui traînent encore
> ailleurs sont périmés.

---

## 🛠️ Pipeline de génération (Higgsfield CLI)

Le CLI `higgsfield` (auth : `higgsfield auth login`) pilote la génération depuis le terminal. Skills installés globalement via `npx skills add higgsfield-ai/skills`.

**Modèle retenu** : **Nano Banana Pro** (`nano_banana_2`) — meilleure adhérence au prompt + grade naturel. 4 crédits / image 4k.

```bash
# Texte → image
higgsfield generate create nano_banana_2 --aspect_ratio 4:5 --resolution 4k --wait --prompt "…"
# Image-to-image (forcer une forme/réf, ex: capsule) : ajouter --image <fichier>
higgsfield generate create nano_banana_2 --aspect_ratio 4:5 --resolution 4k --image ref.jpg --wait --prompt "…"
```

**Ratios par section** (alignés sur la taille réelle des composants) :
- Carousel activités : **3:2 paysage** (carte ~4:3 desktop / `aspect-[4/3]` mobile, `object-cover`).
- Médaillons : **3:2 paysage** (cartes paysage `aspect-[4/3]`, parallax opposé).
- Pourquoi : **4:5 portrait** (carte image portrait desktop, 16:10 mobile).

**Ratios portrait 9:16** — hero mobile et cartes `Hebergements`. Ce ne sont
**pas** du 4:5 : ces deux conteneurs sont `absolute inset-0` dans un cadre
`~100svh`, donc sur un 390×844 leur ratio est ~0,45. Une source 4:5 (0,80) y
perd ~44 % de sa largeur, une 9:16 (0,5625) ~20 % de sa hauteur.

**Coûts** (`higgsfield generate cost <model> …` avant de lancer) :
`nano_banana_2` 4k = 4 crédits, 2k = 2 crédits (mais ~1152 px de large, sous
les 1170 qu'exige un téléphone de 390 pt en DPR 3 — insuffisant pour du plein
cadre). Vidéo : `kling3_0` 9:16 5 s `pro` ≈ 9 crédits, `seedance_2_0` 8 s = 36.

**Conversion AVIF** (après génération) :
```bash
# paysage
ffmpeg -y -i assets-raw/finals/INPUT -vf "scale=2400:-2,unsharp=5:5:0.4:5:5:0.0" \
  -c:v libaom-av1 -still-picture 1 -cpu-used 6 -crf 30 -pix_fmt yuv420p public/images/OUT.avif
# portrait 9:16 (hero, cartes refuges)
ffmpeg -y -i assets-raw/finals/INPUT -vf "scale=1350:-2,unsharp=5:5:0.4:5:5:0.0" …
# portrait 4:5 (slides Pourquoi)
ffmpeg -y -i assets-raw/finals/INPUT -vf "scale=1600:-2,unsharp=5:5:0.55:5:5:0.0" …
```

**Conventions de prompt (design system)** : grade couleur naturel (PAS HDR/CGI), 35mm, palette automne boréal (charred-black, crème, vert-sapin, turquoise fjord, sunset/ambre). Personnes (activités/médaillons) : anonymes, tenues **variées** en tons terreux (ne PAS écrire « cream/earthy tones » seul → uniformise tout le monde). Forme des refuges = **capsule « stadium »** (pill horizontal, bouts arrondis, coque noire mate, baie vitrée incurvée, pilotis acier) → utiliser une photo de réf en `--image` pour la verrouiller.

---

## ✅ Fait & intégré (juin 2026)

### Carousel activités (`Carousel.tsx`) — 5 cartes
1. Kayak sur le fjord — `activites/kayak.avif`
2. Randonnée des sommets — `activites/sommet.avif`
3. Via ferrata — `activites/via-ferrata.avif`
4. **Les pierres debout** — `activites/pierres-debout.avif`
5. Le feu de minuit — `activites/veillee.avif`

⚠️ La carte 4 s'appelait « Terrasse en fête » : dernier vestige d'un registre
« festival » retiré partout ailleurs, remplacé en août 2026. Les données sont
**codées en dur dans `Carousel.tsx`**, pas dans `src/lib/data`.

### `Soir.tsx` — 2 photos en parallax (rideau retiré le 2026-08-29)
Le composant s'appelait `Medaillons` du temps où les cartes étaient ovales.

**Deux fichiers, plus quatre** : `medaillons/feu.avif` et
`medaillons/rassemblement.avif`. Ce sont les **sources de juin**, remises en
place après le retrait du rideau — leur rendu est plus cinématographique que
celui des paires générées ensuite, ce qui est précisément la raison du
changement.

Les quatre AVIF `{feu,terrasse}-{eteint,allume}` qu'elles remplacent sont dans
`assets-raw/alternates/medaillon-*-RIDEAU-RETIRE.avif`. Ils n'existaient que
pour l'effet éteint→allumé : chaque `before` devait être généré **depuis** son
`after` pour que le cadrage coïncide au pixel près, sinon le balayage lisait
comme une coupe entre deux lieux. Cette contrainte n'a plus cours.

⚠️ `rassemblement.avif` montre une vingtaine de personnes sous des guirlandes.
C'est un **écart assumé** à l'ancienne règle éditoriale, tranché le
2026-08-29 — lire la section « Règle éditoriale » de `CLAUDE.md` avant d'y
toucher ou d'invoquer le registre « pas de foule » pour une autre image.

### Pourquoi (`Pourquoi.tsx`) — 3 slides (4:5) — **relot août 2026**

Le lot de juin (`pourquoi-matin` / `-baie` / `-drone`) a été **remplacé** : deux intérieurs consécutifs hors palette (walnut + plantes vertes, un langage étranger au Shou Sugi Ban), et un plan drone où les refuges se lisaient comme mitoyens. Nouveau storyboard : **trois heures du jour, tous extérieurs**.

| Slide | Fichier | Sujet |
|---|---|---|
| 1 | `pourquoi-aube.avif` | Aube, capsule seule dans la brume, aucune personne |
| 2 | `pourquoi-fjord.avif` | Plein jour, terrasse, **une** personne de dos, fjord plein cadre |
| 3 | `pourquoi-crete.avif` | Crépuscule, drone, trois capsules **très** espacées |

⚠️ Le slide 3 a demandé **deux passes**. La v1 plaçait un bout de terrasse d'un 4ᵉ bâtiment dans le coin inférieur gauche — ce qui réintroduisait exactement la lecture « voisin collé » qu'on voulait supprimer. La v2 le corrige en repassant la v1 en `--image` avec une consigne de retrait explicite. Variante conservée : `_raw/alternates/crete-v1-deck-intrusion.png`.

#### Prompts littéraux

> **Leçon du lot de juin** : les prompts n'avaient été consignés nulle part, ce qui rendait toute régénération à l'identique impossible. Ceux-ci sont copiables tels quels.

**Slide 1 — `pourquoi-aube`** · `--aspect_ratio 4:5 --resolution 4k --image <ref capsule>`
(réf utilisée : `hero-shape.avif` converti en JPEG — l'AVIF n'est pas fiable à l'upload)
```
A single charred-black timber capsule cabin, stadium-shaped (horizontal pill silhouette,
fully rounded ends) exactly like the reference image, matte Shou Sugi Ban shell, curved
panoramic glass on the front end, raised on minimal black steel stilts. Dawn, low blue-grey
light before sunrise. Dense ground fog drifts at knee height beneath the cabin so the capsule
appears to float above it. Golden birches and red maples around it, wet moss. One warm amber
light inside, no other light source. No people. Distant St. Lawrence fjord barely visible
through the trees. Natural colour grade, NOT HDR, NOT CGI-looking. 35mm lens, shallow depth
of field, architectural editorial photography. Charlevoix, Quebec, autumn boreal forest.
Colour palette: charred black, cream mist, deep forest green, faint turquoise water, amber
interior. No signage, no logos, no text. Vertical 4:5 composition.
```

**Slide 2 — `pourquoi-fjord`** · `--image <slide 1>` (verrouille l'architecture ET le grade)
```
The same charred-black stadium capsule cabin as the reference image, same architecture, same
matte Shou Sugi Ban shell and curved panoramic glass, but now seen from its outdoor wooden
terrace deck at midday under clear high autumn light. The St. Lawrence fjord fills most of the
frame below and beyond the deck: turquoise water with sunlit glints, dark forested mountains on
the far shore. Exactly ONE person, anonymous, seen from behind, leaning on the black steel
guardrail of the terrace, looking out at the water. Autumn birches and red maples at the edges
of frame. Only one person in the entire image, no other figures. Natural colour grade, NOT HDR,
NOT CGI-looking. 35mm lens, shallow depth of field, architectural editorial photography.
Charlevoix, Quebec. Colour palette: charred black, cream, turquoise fjord, deep forest green.
No signage, no logos, no text. Vertical 4:5 composition.
```

**Slide 3 v1 — `pourquoi-crete`** · `--image _raw/finals/pourquoi-drone.jpeg` (conserve le paysage de juin, jugé excellent)
```
Aerial drone view at dusk over the same forested ridge above the St. Lawrence fjord as the
reference image — keep that landscape, that terrain and that light direction. CRITICAL CHANGE:
the cabins must be very far apart, not clustered. ONE charred-black stadium capsule cabin in the
near foreground, sharp and clearly the subject, its terrace and interior glowing warm amber.
Only TWO other capsules exist and both are extremely distant, separated from the first and from
each other by vast unbroken stretches of dense boreal forest covering most of the frame — each
reduced to a single tiny pinprick of warm light almost lost in the evening haze, one of them near
the very top edge of the frame. Huge empty forest between all three. Fjord far below, deep
turquoise turning to indigo, low mist on the water. Sunset sky, orange to cream to deep blue.
No people, no roads, no paths, no power lines. Natural colour grade, NOT HDR, NOT CGI-looking.
Architectural editorial aerial photography. Charlevoix, Quebec, autumn boreal forest. Colour
palette: charred black, amber, turquoise, sunset orange, cream. No signage, no logos, no text.
Vertical 4:5 composition.
```

**Slide 3 v2 — correctif** · `--image <v1>`
```
Keep this exact aerial drone scene, landscape, cliff, fjord, mist and sunset light from the
reference image. Make only these corrections: (1) REMOVE COMPLETELY the fragment of wooden deck
and structure intruding at the bottom-left corner of the frame — that entire corner must be
nothing but bare rock, autumn shrubs and forest, with absolutely no built structure, no deck, no
railing, no post of any kind. (2) There must be exactly THREE capsule cabins in the whole image
and no more: the one on the cliff in the foreground, plus the two tiny distant ones already
visible far away on the ridge and near the shore. (3) No structure of any kind may touch or
approach any edge of the frame. Everything else stays identical: the charred-black stadium
capsule on its cliff terrace with warm amber interior glow, vast unbroken boreal forest,
turquoise fjord, low mist, sunset sky orange to cream to deep blue. No people, no roads, no
paths, no power lines. Natural colour grade, NOT HDR, NOT CGI-looking. Vertical 4:5 composition.
```

#### Ce qui marche, en pratique
- **Chaîner les références** : slide 1 sert de `--image` au slide 2. C'est ce qui tient le grade et l'architecture d'un plan à l'autre, mieux que de répéter la description.
- **Compter les sujets à voix haute** dans le prompt (« exactly THREE », « exactly ONE person, no other figures ») — les formulations qualitatives (« few », « isolated ») ne sont pas respectées.
- **Interdire les bords** : « no structure may touch any edge of the frame » évite les intrusions de coin, le défaut le plus fréquent sur les plans larges.

#### ⚠️ Les limites de « keep everything, change only X » — mesurées

Repasser sa propre sortie en `--image` avec cette formule ne sait corriger
qu'un défaut **localisé**. Testé dans les deux sens sur le même lot :

| Demande | Résultat |
|---|---|
| Ajouter des objets sur une terrasse existante | ✅ parfait — cadrage, capsule, ciel, crêtes et sol identiques, objets apparus au compte exact |
| Retirer un bout de bâtiment dans un coin | ✅ (slide 3 v2 de Pourquoi) |
| **Rapprocher la caméra / recadrer** | ❌ le cadrage fait partie du « everything » qu'on demande de préserver : les deux consignes se contredisent et la préservation gagne. La capsule est passée de 25 % à 30 % de largeur, et un « slightly deeper exposure » explicite a été ignoré (Y 161,9 → 161,1) |

Pour changer un cadrage, il faut **repartir de la source d'origine** et
accepter que le reste bouge.

#### ⚠️ Le conteneur est plus étroit que TOUTE source générée — composer en conséquence

Les cartes `Hebergements` et le hero sont `absolute inset-0` dans un cadre
`~100lvh` : à 390×844 le conteneur mesure 366×820, soit un ratio de **0,446**.
Le format le plus étroit que produise `nano_banana_2` est 9:16 = 0,5625.
`object-cover` jette donc **toujours ~21 % de la largeur**, ~10 % de chaque
côté, quoi qu'on fasse.

| Source | Ratio | Jeté sur un conteneur à 0,446 |
|---|---|---|
| 16:9 | 1,778 | **75 % de la largeur** |
| 9:16 | 0,563 | **21 % de la largeur** |

⚠️ **Livrer l'AVIF dans un ratio plus étroit ne sert à rien.** Testé : pré-couper
la source à 0,50 ou 0,47 avant l'encodage donne un rendu **identique** dans la
carte — ça déplace simplement le recadrage de ffmpeg vers le navigateur, la
zone visible est la même. Le seul levier est la composition.

**Donc : le sujet doit tenir dans les 80 % CENTRAUX de la largeur.** En clair,
une capsule à **~45 % de la largeur du cadre**, pas 60 %. Le hero le supporte
avec sa capsule à ~30 % — le recadrage mange du vide. `brume-portrait` a la
sienne à ~60 % et les bords coupent dans la capsule et la terrasse.

C'est l'exact inverse du réflexe qu'on a en corrigeant un « sujet trop loin » :
la marge latérale n'est pas du gaspillage, c'est la réserve de recadrage.

#### ⚠️ Doser « gros plan » et « paysage » ensemble, et les chiffrer

« La capsule remplit le cadre » supprime tout le paysage. « La capsule est au
loin » perd l'architecture, qui est ce que le site vend. La formulation qui
marche est **chiffrée et bilatérale** :

> the cabin spans roughly SIXTY PERCENT of the frame width — large enough to
> dominate, but with open landscape still visible to its left and right and
> above it

Et **interdire explicitement le terrain non présent dans la référence** : une
passe a inventé un précipice de toutes pièces sous un refuge qui n'en a pas.

#### ⚠️ Réserver une zone pour la typographie — et elle est PLUS GRANDE qu'un tiers

Les cartes `Hebergements` typographient surnom, nom, description et capacité
**en bas à gauche**. Mesuré à 390×844, texte masqué, fond échantillonné sous
chaque niveau :

| Niveau | Hauteur dans la carte | Ratio |
|---|---|---|
| surnom | 39 % | 4,29 |
| **nom** | 45 % | **2,03** — posé sur l'intérieur éclairé |
| description | 54–70 % | 3,30 – 3,85 |
| capacité | 80 % | 8,10 |

Deux enseignements coûteux :

1. **Le niveau qui échoue est le NOM, pas le surnom.** Le backlog accusait le
   surnom depuis une observation à l'œil ; c'est le seul des quatre qui passe.
2. **Le bloc texte occupe de 39 % à 100 % de la hauteur** sur un écran étroit,
   parce que la description y passe à cinq lignes au lieu de trois. Demander
   « le tiers bas sombre » ne couvre donc que la moitié du problème.

La consigne correcte, à mettre dans le prompt :

> the LOWER SIXTY PERCENT of the frame must stay visually quiet and DARK,
> especially on its LEFT side: a caption, a large title and a paragraph are
> typeset over that area. No lit window, no bright highlight and no
> light-coloured object may sit there. The lit interior of the cabin must be in
> the UPPER half of the frame.

⚠️ **Ne pas régler ça par un voile CSS.** Un dégradé plein cadre a été
construit et mesuré — il faisait passer le nom de 2,03 à largement au-delà de
AA — puis retiré : assombrir les 60 % bas de la photo va contre l'objet même
de la section, qui est de montrer le refuge. La typographie a été resserrée de
son côté (nom `text-6xl` → `text-5xl`, description `text-lg/relaxed` →
`text-base/snug` sous `md`, ~45 px gagnés), mais elle ne peut pas fermer
l'écart seule. **C'est le cadrage de l'image qui doit céder, pas la photo.**

Respecté du premier coup, et ça travaille directement pour le contraste du
surnom. Même logique pour le hero, en trois bandes : tiers haut vide (wordmark
`text-[18vw]`), bande centrale pour le sujet, tiers bas calme (tagline).

#### ⚠️ Grade : mesurer avant de corriger, et ne pas forcer un chiffre

Trois erreurs commises sur ce lot, chacune coûteuse :

1. **`sqrt((U_moy−128)² + (V_moy−128)²)` n'est PAS la saturation.** C'est la
   saturation *de la moyenne*, donc une **dominante de couleur**. Utiliser
   `signalstats` `SATAVG` (moyenne des saturations par pixel).
2. **`eq=saturation` est presque toujours le mauvais outil** — il multiplie
   tout, donc pousse au néon ce qui est déjà saturé et ne fait rien sur le
   neutre. Si la couleur manque vraiment, c'est `vibrance`.
3. **Une image pâle manque souvent de point noir, pas de couleur.** Et un ciel
   mauve ou un intérieur rouge se corrigent **par canal** (`curves=b`,
   `curves=g`), là où saturation et gamma ne peuvent rien.

Le « pop » perçu vient autant du **contraste** que de la saturation : relâcher
les deux ensemble.

Mesure d'une zone (moyenne exacte) :
```bash
ffmpeg -v error -i img.avif -vf "crop=iw:ih*0.18:0:0,scale=1:1" \
  -f rawvideo -pix_fmt rgb24 - | od -An -tu1
```

#### 🎬 Vidéo : aucun modèle ne boucle

Constat général, pas un défaut de formulation : le générateur produit N
secondes et s'arrête où il en est. Le bouclage se fait **toujours en post**,
par un fondu de la queue sur la tête — le mouvement reste continu vers
l'avant, contrairement à un ping-pong qui l'inverse et trahit l'eau.

```bash
D=5.04; X=1.0; OFF=$(awk -v d=$D -v x=$X 'BEGIN{print d-2*x}')
ffmpeg -y -i in.mp4 -filter_complex \
  "[0:v]split[b][p];[b]trim=start=$X,setpts=PTS-STARTPTS[body];\
   [p]trim=start=0:end=$X,setpts=PTS-STARTPTS[head];\
   [body][head]xfade=transition=fade:duration=$X:offset=$OFF,format=yuv420p[v]" \
  -map "[v]" -an -c:v libx264 -crf 19 -preset slow -movflags +faststart out.mp4
```

- **Caméra verrouillée au tournage.** C'est ce qui rend le fondu invisible, et
  ça divise le poids par trois : un plan fixe tient dans 800 Ko là où un plan
  qui bouge en demande 2,2 Mo.
- **Le fondu LONG fantôme MOINS que le court.** Au point 50/50 les deux images
  superposées sont `source[D−X/2]` et `source[X/2]`, écartées de `D−X` : plus
  `X` grandit, plus elles se rapprochent. Mesuré en énergie de contours :
  0,6 s → −10 %, 1,2 s → −7 %, 2,0 s → −4 %, 2,8 s → −4,5 % (plateau).
- **Ne pas descendre sous `crf 19`** : `crf 23` coûtait 6,5 % de netteté,
  `crf 19` 1,9 %.
- **Mesurer la couture contre le pas d'image CONSÉCUTIF**, pas contre un
  intervalle arbitraire. Une couture à 0,974 est mauvaise si les images
  voisines sont à 0,996, et normale si elles sont à 0,972.

---

---

## 🗂️ Prompts littéraux — lot août 2026

### `activites/belugas.avif` · 3:2 4k · `--image assets-raw/refs/ref-galets.png`
Quatre passes. Les trois premières ont échoué en cherchant à « désaturer » —
voir le grief et le diagnostic dans `docs/backlog.md`. Prompt retenu :
```
A scenic view across the St. Lawrence estuary in Charlevoix, Quebec, from a rocky
point on the shore. Scenic and atmospheric, with real depth: dark mountain ridges of
the far shore layered one behind the other across the water, each ridge paler than the
one in front, and a low band of mist lying on the water at their base. The rocky shore
sweeps in from the bottom-left third of the frame, wet dark rock and pale lichen.

Late afternoon. The sun is low and raking across the estuary from the left, filtered
through high thin cloud. The light is DIRECTIONAL and moody, with deep shadow in the
rock and long silver highlights on the water. It must NOT be flat and it must NOT be
overcast.

CRITICAL — the colour: reproduce the exact colour palette, saturation level and colour
grade of the reference image. […]

The water is dark slate grey-green. Exactly THREE beluga whales close to shore in the
near-middle distance, clearly the subject of the photograph: their white backs and
rounded heads break the surface and read unmistakably as belugas, sharply in focus,
brightly contrasted against the dark water. One is arching, the two others show only
the back. Nothing else in the water.

NO people, no boats, no buildings, no signage, no logos, no text. Natural colour grade,
NOT HDR, NOT CGI-looking, crisp sharp detail, deep focus throughout. 35mm lens,
editorial landscape photography. Horizontal 3:2 composition.
```

### `hero-shape-portrait.avif` + `hero-loop-portrait.mp4` · 9:16
Still : `nano_banana_2 --aspect_ratio 9:16 --resolution 4k --image assets-raw/misc/hero-aquilon.png`,
composition en trois bandes (voir plus haut). ⚠️ **Le plan est trop large** —
la capsule fait ~30 % de la largeur là où le hero desktop est un gros plan. À
refaire, consignes détaillées dans `docs/backlog.md`.

Vidéo : `kling3_0 --aspect_ratio 9:16 --duration 5 --mode pro --sound off
--start-image <le still validé>` — la première image devient donc exactement
le poster. Prompt centré sur « locked-off tripod shot, the camera does NOT move
at all » + mouvement d'ambiance seulement.

Grade appliqué en post, **à réappliquer à l'identique au poster ET à la
vidéo** — archivé dans `assets-raw/finals/hero-portrait-GRADE.txt`.

### `refuges/brume-portrait.avif` · 9:16 4k · `--image assets-raw/refs/ref-brume.png`
Quatre passes ; le prompt retenu est la v2 (gros plan, `SIXTY PERCENT` de la
largeur, trois bandes, tiers bas-gauche sombre réservé à la typo) suivie d'une
**correction localisée** qui remeuble la terrasse :
```
Keep this exact photograph. Same framing, same camera position, same cabin, same size
and position of the cabin in the frame, same deck, same rocky ground, same mountains,
same sky, same light, same colour palette, same saturation.

Make ONE change: the pale timber deck in front of the cabin is currently bare. Furnish
it, and place EXACTLY these objects and nothing else:
  - ONE round wooden barrel hot tub […] with a little steam rising
  - TWO floor cushions in oatmeal linen
  - THREE pillar candles, each in its own matte black holder
  - ONE hurricane lantern with a warm flame inside
That is the complete list. NO other objects: no blankets, no throws, no towels, no
string lights, no extra candles, no extra lanterns, no plants, no furniture, no rugs,
no firewood on the deck, no bottles, no glasses, no books. At least half of the deck
surface must remain bare timber.
```
Aucun grade nécessaire : saturation 17,73 contre 17,69 pour le paysage.

---

---

## 🧱 CANON — trois blocs à copier LITTÉRALEMENT dans chaque prompt

> **Le problème que ces blocs règlent** (constaté le 2026-08-29, 12 crédits) : jusqu'ici
> chaque prompt redécrivait la capsule avec les mots du moment. Résultat, une architecture
> différente à chaque génération — vitrage absent, porte disparue, cheminée déplacée, deck
> en pin blanc brut au lieu de bois teinté. Aucun de ces détails n'était « oublié » : ils
> n'avaient jamais été écrits une bonne fois. **Un canon qu'on paraphrase n'est pas un
> canon** — ces blocs se collent tels quels, on ne les reformule pas.

### Bloc A — COQUE (ne varie JAMAIS)

```
THE CABIN ARCHITECTURE IS FIXED AND MUST BE REPRODUCED EXACTLY: a horizontal stadium/pill volume with both short ends fully rounded into half-circles. The outer shell is matte charred-black Shou Sugi Ban timber with a SMOOTH, FINE, UNIFORM surface: no wide planks, no visible battens, no ribbing, no corrugation, no vertical striping, matte and never glossy. The far rounded end is a solid black volume with no opening. One entire long side is glazed floor to ceiling in tall narrow panels with slim black frames, and a two-panel SLIDING GLASS DOOR sits at the CENTRE of that glazed side. THE INTERIOR MUST BE CLEARLY AND FULLY VISIBLE THROUGH THAT GLASS, warmly lit in amber, with the bed, the kitchen and the wood stove all readable from outside: the cream linen curtains are retractable and are drawn fully aside to the two ends of the glazed side, never closed across it, never blocking the view in. The glass reads as glass, with faint reflections. A slim black cylindrical stove flue rises through the roof on the RIGHT, near the rounded end. The cabin is raised on slim black steel stilts above a deck of WARM MID-BROWN STAINED timber boards, never pale raw pine, never whitewashed. A few timber steps descend from the near side of the deck to the ground, and at their foot sits one small circular stone fire pit with a low fire burning in it.
```

⚠️ **Trois pièges corrigés le 2026-08-29**, chacun payé en génération :
- **Pas de lattes.** Une première version du bloc disait `narrow VERTICAL battens` — invention
  pure : la coque des images d'origine est **lisse et fine**. Le mot a suffi à couvrir tout le
  refuge de cannelures.
- **L'intérieur visible est un invariant**, pas un effet de scène. Sans la phrase explicite, le
  modèle ferme les rideaux ou réduit le vitrage à une fenêtre, et le site perd ce qu'il vend.
- **Marches + foyer extérieur** font partie du produit et doivent être demandés, sinon le deck
  flotte sans lien avec le sol.

### Bloc B — GRADE (ne varie JAMAIS)

```
LIGHT AND COLOUR ARE FIXED: late afternoon going into sunset, the sun low and raking from
the LEFT, filtered through high thin cloud. Long soft shadows. The sky is a warm TAN-CREAM,
around RGB 237-220-209: warmer than neutral, and never pink, never magenta, never violet.
The cabin interior glows a deep amber, around RGB 142-88-61: amber, not red.
Deep blacks in the shell, around Y 24, so the image is never washed out or milky.
Natural colour grade, NOT HDR, NOT CGI-looking, crisp sharp detail throughout.
35mm lens, architectural editorial photography, Charlevoix Quebec in autumn.
No people, no other buildings, no roads, no paths, no power lines, no signage, no text.
```

⚠️ **Ne jamais ajouter d'adjectif de chaleur** (`golden hour`, `blazing`, `fiery`,
`burnt`). Ils pilotent la saturation plus fort que l'image de référence et l'ont fait
dérailler quatre fois sur `belugas`. Le bloc B dit déjà l'heure : c'est suffisant.

### Bloc C — CADRAGE (le même pour les trois refuges)

```
CAMERA: eye level, standing back and to the LEFT of the cabin. The cabin is seen at a
three-quarter angle: its glazed side recedes diagonally from left to right, the rounded far
end reads as a solid volume in perspective, and the deck runs toward the lower-left corner.
This is NOT a flat head-on elevation. The cabin sits RIGHT OF CENTRE on the rule of thirds,
spanning about SIXTY PERCENT of the frame width in 16:9 and about FORTY-FIVE PERCENT in 9:16,
with open landscape clearly visible beyond BOTH of its ends and above it.
```

### La règle qui a coûté le plus cher

**L'intérieur ne se décrit JAMAIS dans le même prompt qu'une scène.** Mesuré trois fois de
suite : un bloc intérieur détaillé (~1300 caractères) fait rapprocher la caméra quoi qu'on
écrive sur le cadrage — le modèle conclut que le sujet est l'intérieur et cadre l'intérieur.
Le pourcentage de largeur perd systématiquement l'arbitrage, y compris sous un
« keep this exact photograph, same framing ».

**Deux passes séparées, dans cet ordre :**
1. **La scène** — blocs A + B + C + le terrain. L'intérieur n'est mentionné que par
   « the interior glows warm amber and is visible through the glass », rien de plus.
2. **L'aménagement** — en repassant la scène validée en `--image`, avec une liste
   **courte et comptée**, et le cadrage répété en tête et en queue.

### ⚠️ `--image` est un PIÈGE dès qu'on veut changer la géométrie

La leçon la plus chère du 2026-08-29, mesurée sur une dizaine de passes.

La doc affirmait que `--image` verrouille « la silhouette et le grade, jamais
l'aménagement ». **C'est faux dans les deux sens** :

1. **Elle verrouille aussi le DÉCOR.** Une passe a montré `AUB-A` (forêt,
   ruisseau) en référence pendant que le texte décrivait sur cinq lignes
   l'estuaire, la falaise ocre et un cargo. Résultat : une image en forêt.
   Quand le texte et l'image se contredisent, **l'image gagne**.
2. **Elle rend un changement de forme presque impossible.** Quatre passes ont
   demandé d'arrondir une capsule trop rectangulaire, en partant à chaque fois
   d'une image rectangulaire. Elle est restée rectangulaire. On demandait
   l'arrondi à un modèle à qui on montrait simultanément un rectangle.

**Et l'empilement dégrade.** `AUB-A` était le produit de trois générations
chaînées (référence → scène → coque refaite). Verdict de Patrick : « trop
cartoon, ça ne semble plus authentique ». Ce n'était pas le prompt, c'était le
nombre de passes.

**Règle** : pour tout changement **structurel** — forme, cadrage, décor,
matériau — on **repart de zéro sans `--image`**, avec les blocs A + B + C qui
portent l'architecture seuls. C'est ce qui a débloqué la forme *et* le rendu
photographique du même coup, après quatre passes stériles en image-to-image.

`--image` reste bon pour une modification **localisée et additive** dans une
scène qu'on veut garder telle quelle : meubler une terrasse vide, retirer un
objet dans un coin. Rien de plus.

### Bloc D — AMÉNAGEMENT, version courte (passe 2 seulement)

Version longue abandonnée : elle noyait le prompt. Ne nommer que ce qui **manque** à
`aubepine` et `galets` par rapport à `brume`, qui est le niveau de référence :

```
Inside the cabin only, seen through the glass, add exactly these FOUR things:
a full-height pale timber partition wall between the bed and the kitchen;
a low pale timber kitchen island under the amber globe pendant, with one bowl of fruit on it;
a second cream boucle armchair beside the first, with one small round black side table;
one potted fern on the floor beside the island.
Add nothing else. Everything else in the interior stays exactly as it is.
```

---

## 🗂️ Prompts littéraux — lot du 2026-08-29

⚠️ **Ils sont dans des FICHIERS, pas recopiés ici** : `docs/prompts/`. Ils font
2 à 5 ko chacun et les recopier dans ce document le rendrait illisible. Ils se
passent directement au CLI :

```bash
higgsfield generate create nano_banana_2 --aspect_ratio 16:9 --resolution 4k \
  --wait --prompt "$(cat docs/prompts/G3.txt)"
```

| Fichier | A produit | Notes |
|---|---|---|
| `CANON-complet.txt` | — | Le canon autoportant : coque, vitrage, intérieur, deck, cadrage, grade. Base de tout prompt de refuge. **Sans `--image`.** |
| `G3.txt` | `refuges/galets.avif` | Canon + estuaire depuis un ressaut rocheux. ⚠️ Le rendu retenu par Patrick est une **boîte à coins arrondis**, hors canon — voir `docs/backlog.md`. |
| `A3.txt` | `refuges/aubepine.avif` | Canon + clairière au bord d'un ruisseau. ⚠️ Le rendu retenu montre en fait un **cap sur l'estuaire** : Patrick a choisi parmi plusieurs sorties, celle-ci ne vient pas de ce décor. Le prompt est conservé parce que c'est lui qui a produit la bonne **forme**. |
| `act-pierres.txt` | `activites/pierres-debout.avif` | ⚠️ Produit du Hopewell Rocks reconnaissable. À ne PAS réutiliser tel quel. |
| `act-marmites.txt` | `assets-raw/alternates/activite-marmites-geant-NON-RETENUE.png` | Marmites glaciaires. Non retenue, mais générée et payée — disponible sans coût. |

⚠️ **L'appariement prompt → image finale est approximatif** pour les deux
refuges. Patrick a récupéré ses images directement dans l'interface Higgsfield
parmi plusieurs sorties, et l'horodatage des fichiers (`hf_20260830_*`) ne
permet pas de remonter au prompt exact à coup sûr. Les sources 4k sont dans
`assets-raw/finals/refuge-{galets,aubepine}-2026-08.png` — c'est **elles** qui
font foi, pas une régénération.

`menu-panel.avif` n'a pas de prompt : c'est un **recadrage** de
`assets-raw/finals/menu-panel-2026-08.png`, tiers droit, en 2:3 :

```bash
ffmpeg -y -i assets-raw/finals/menu-panel-2026-08.png \
  -vf "crop=2048:3072:3456:0,scale=1000:-2,unsharp=5:5:0.4:5:5:0.0" \
  -c:v libaom-av1 -still-picture 1 -cpu-used 6 -crf 36 -pix_fmt yuv420p \
  public/images/menu-panel.avif
```

⚠️ `crf 36` et 1000 px de large, pas les 2400/crf 30 habituels : le panneau est
un `basis-[25%]`, donc ~354 px à l'écran, et le fichier est téléchargé par
**tous** les visiteurs desktop même sans ouvrir le menu (l'overlay vit dans le
DOM en `visibility:hidden`, ce qui ne suspend pas l'IntersectionObserver de
`next/image`). 220 ko → 124 ko.

---

## ✅ PLAN — portraits 9:16 des refuges — EXÉCUTÉ, réussi du premier coup

> Les trois portraits ont été générés le 2026-08-30 avec ce plan, **une seule
> passe chacun, aucune reprise** — après une séance entière d'essais ratés sur
> les paysages. Prompt littéral : `docs/prompts/portrait-9-16.txt`.
>
> Mesuré sur les sorties : bas-gauche à Y 22 / 32 / 15, donc le niveau « nom »
> passe enfin ; ciels à `221 202 190`, `222 202 188` et `204 183 167` — chauds,
> aucun rose. Recadrage réel simulé à 0,446 : rien d'essentiel n'est coupé.
>
> **Ce qui a fait la différence** : chiffrer la MARGE (« au moins 25 % de
> paysage vide de chaque côté ») et pas seulement la largeur du sujet. Les
> quatre passes ratées de `brume-portrait` disaient « la capsule fait 60 % » —
> le modèle la centrait alors et remplissait tout le reste.

Écrit le 2026-08-30 pour réussir **du premier coup**, en rassemblant tout ce
qui a été mesuré et payé. Chaque contrainte ci-dessous a coûté au moins une
génération ratée.

### Modèle : `nano_banana_2`, PAS Soul

Testé le 2026-08-30 : **Higgsfield Soul 2.0** (`text2image_soul_v2`) coûte
**0,12 crédit** contre 4 et donne un rendu franchement plus cinématographique
— grain, contraste, lumière. Mais sur un refuge il **invente l'architecture** :
l'essai a produit un chalet en porte-à-faux à deux niveaux, un décor de vallée
au lieu du fjord de la référence, et a ignoré chaque consigne de composition.

> **Règle : Soul pour les paysages et les activités, Nano Banana Pro pour tout
> ce qui contient un refuge.** La fidélité architecturale est le seul critère
> qui compte ici, et c'est précisément ce que Soul ne tient pas.

Syntaxe Soul, si besoin un jour (elle est pénible et a demandé trois essais) :
```bash
UP=$(higgsfield upload create ref.png | tail -1)
higgsfield generate create text2image_soul_v2 --aspect_ratio 9:16 --quality 2k \
  --medias '[{"role":"image","data":{"type":"media_input","id":"'"$UP"'"}}]' \
  --wait --prompt "…"
```

### Le calcul qui commande tout

| Grandeur | Valeur | Conséquence |
|---|---|---|
| Conteneur à 390×844 | 366×820, ratio **0,446** | — |
| Source 9:16 | ratio **0,5625** | `object-cover` jette **21 % de la largeur** |
| Marge perdue | **10,5 % de chaque côté** | le sujet doit tenir dans les **79 % centraux** |

**Donc la capsule fait 45 % de la largeur, pas 60.** Vérifié dans les deux
sens : le hero portrait est à ~45 % et passe parfaitement ; `brume-portrait`
a été briefée à « SIXTY PERCENT », la capsule y occupe ~95 % et les bords
coupent dans le bain nordique et le bout arrondi.

⚠️ **Chiffrer la MARGE, pas seulement le sujet.** C'est la formulation qui
manquait : « la capsule fait 45 % » laisse le modèle la centrer et remplir le
reste. Il faut exiger **au moins 25 % de paysage vide de chaque côté**.

### Les trois bandes verticales

Reprises du hero portrait, qui est le seul portrait validé du site :

1. **Tiers haut** — ciel et crêtes lointaines, calme et vide.
2. **Bande centrale** — la capsule, son centre vers **35-40 % de la hauteur**.
3. **60 % bas** — sombre et calme, **surtout à gauche**.

### La zone typographique, mesurée

Les cartes typographient surnom, nom, description et capacité **en bas à
gauche**. Mesuré à 390×844, texte masqué, fond échantillonné :

| Niveau | Hauteur | Ratio |
|---|---|---|
| surnom | 39 % | 4,29 |
| **nom** | 45 % | **2,03** ← le seul qui échoue |
| description | 54-70 % | 3,30–3,85 |
| capacité | 80 % | 8,10 |

⚠️ **Ne pas corriger ça par un voile CSS** : construit, mesuré, puis retiré —
assombrir la photo va contre l'objet de la section. C'est le cadrage qui cède.

### Méthode : `--image` = la desktop du refuge

Contre-intuitif après les leçons du jour, mais correct **ici** : on veut
justement conserver le décor, la palette et l'architecture. Le changement de
ratio (16:9 → 9:16) force de toute façon le modèle à recomposer, donc on
n'affronte pas la préservation — on s'appuie dessus.

⚠️ Une seule passe par refuge. Ne jamais enchaîner sur une sortie déjà
générée : trois passes chaînées ont donné le rendu « cartoon » d'Aubépine.

| Refuge | Référence `--image` |
|---|---|
| Brume | `assets-raw/refs/ref-brume.png` |
| Aubépine | `assets-raw/finals/refuge-aubepine-2026-08.png` |
| Galets | `assets-raw/finals/refuge-galets-2026-08.png` |

### Le prompt, structure exacte

Le décor n'est PAS décrit : la référence le porte. Tout le texte sert la
composition, qui est la seule chose qui change.

```
Recompose this exact scene as a VERTICAL 9:16 photograph. Same cabin, same
architecture, same landscape, same light direction, same colour palette and
same saturation as the reference image. Do not invent a different building.

FRAMING IS THE ENTIRE POINT OF THIS IMAGE:
- The cabin spans only about FORTY-FIVE PERCENT of the frame width. It is NOT
  a close-up. It must NOT fill the frame.
- Leave generous open landscape on BOTH sides of it: at least TWENTY-FIVE
  PERCENT of the frame width empty on the left AND on the right. No part of
  the cabin, its deck, its hot tub or its steps may come near either edge.
- The cabin sits in the middle band, its centre around 35-40% of the frame
  height, so the whole building and its lit interior are in the UPPER HALF.
- The upper third is sky and distant ridges: calm, open, uncluttered.
- The LOWER SIXTY PERCENT of the frame must stay visually quiet and DARK,
  especially on its LEFT side: a caption, a large title and a paragraph are
  typeset over that area. No lit window, no bright highlight, no light-coloured
  object may sit there.

Late afternoon into sunset, sun low and raking from the LEFT. Warm tan-cream
sky around RGB 237-220-209, never pink, never magenta. Interior amber around
RGB 142-88-61. Deep blacks in the shell. Natural colour grade, NOT HDR, NOT
CGI-looking, crisp detail, real photographic grain. 35mm lens, architectural
editorial photography. No people, no signage, no logos, no text.
Vertical 9:16 composition.
```

### Contrôle avant intégration

```bash
# 1. la capsule tient-elle dans les 79 % centraux ?
#    (ouvrir l'image et vérifier à l'œil : rien du bâti près des bords)
# 2. le bas-gauche est-il sombre ?
ffmpeg -v error -i OUT.png -vf "crop=iw*0.5:ih*0.4:0:ih*0.6,scale=1:1" \
  -f rawvideo -pix_fmt rgb24 - | od -An -tu1     # viser une luma basse
# 3. le ciel est-il dans la famille ? (cible 237 220 209)
ffmpeg -v error -i OUT.png -vf "crop=iw:ih*0.18:0:0,scale=1:1" \
  -f rawvideo -pix_fmt rgb24 - | od -An -tu1
```

Encodage : `scale=1350:-2,unsharp=5:5:0.4:5:5:0.0`, `crf 30`.
Puis deux lignes `imagePortrait` dans `src/lib/data/refuges.ts` (Brume en a
déjà une, à écraser).

## ⏳ Reste à produire

- **`refuges/aubepine-portrait.avif`** et **`refuges/galets-portrait.avif`** —
  9:16, sur le gabarit de `brume-portrait`. Le champ `imagePortrait` de
  `src/lib/data/refuges.ts` est optionnel : sans eux, ces deux refuges servent
  leur paysage partout, sans état cassé.
- **`hero-shape-portrait` en gros plan** — voir `docs/backlog.md`.
- **`hero-loop.mp4` (desktop)** — plan mou et boucle faible à la source ; la
  version en place est recousue en post en attendant. Voir `docs/backlog.md`.
- `lieu-charlevoix.avif` (4:5) — section `Lieu.tsx`, non implémentée
- Galerie ambiance, 6 images — section `Galerie.tsx`, non implémentée
- Mini-loops d'ambiance (brume, feuille, eau)

---

## 📦 Archive sources
**`/assets-raw/`** à la racine (local, gitignoré) :
- `finals/` — sources jpg/png/mp4 des assets live (renommées)
- `alternates/` — variantes générées non retenues, avec le motif du rejet dans
  le nom de fichier (`belugas-v2-trop-plat`, `brume-portrait-v3-sans-deck`…)
- `refs/` — images à repasser en `--image`. **Passer un JPEG ou un PNG, jamais
  un AVIF** : l'upload échoue.
- `misc/` — `hero-aquilon.png`, la source du hero paysage
- `_INDEX.md` — table source ↔ asset live

⚠️ **Aucune source n'existe** pour `refuges/brume.avif`, `refuges/aubepine.avif`
ni pour la vidéo desktop d'origine : ces trois-là ne sont pas régénérables à
l'identique.
