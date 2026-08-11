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
4. **Le passage des bélugas** — `activites/belugas.avif`
5. Le feu de minuit — `activites/veillee.avif`

⚠️ La carte 4 s'appelait « Terrasse en fête » : dernier vestige d'un registre
« festival » retiré partout ailleurs, remplacé en août 2026. Les données sont
**codées en dur dans `Carousel.tsx`**, pas dans `src/lib/data`.

### `Soir.tsx` — 2 paires de rideaux éteint→allumé
Le composant s'appelait `Medaillons` du temps où les cartes étaient ovales.
Quatre fichiers, pas deux :
`medaillons/feu-{eteint,allume}.avif` et `medaillons/terrasse-{eteint,allume}.avif`.
Le duo se répond — le feu commun vu d'en bas, et la terrasse privée d'où on le
regarde ; la lueur du feu est un point orange au loin dans les arbres de la
seconde image, et disparaît dans sa version éteinte.

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

#### ⚠️ Réserver une zone pour la typographie

Les cartes `Hebergements` typographient le surnom et le nom **en bas à
gauche**. Le demander noir sur blanc dans le prompt :

> the BOTTOM THIRD must stay visually QUIET and DARK, especially in its LEFT
> half: a caption is typeset over that corner, so no bright highlight, no busy
> detail and no light-coloured object may sit in the bottom-left of the frame

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
