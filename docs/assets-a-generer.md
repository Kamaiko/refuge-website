# Assets — Refuges Aquilon

> État des assets visuels. Une partie est **générée et intégrée** (juin 2026, via Higgsfield CLI) ; il reste quelques plans à produire. Les **sources** des images live sont archivées dans `public/images/_raw/` (gitignoré, voir `_raw/_INDEX.md`).

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

**Conversion AVIF** (après génération) :
```bash
cd public/images
ffmpeg -y -i _raw/finals/INPUT -vf "scale=2400:-2" -c:v libaom-av1 -still-picture 1 -cpu-used 6 -crf 30 -pix_fmt yuv420p OUTPUT.avif
# Pourquoi (portrait) : scale=1600:-2
```

**Conventions de prompt (design system)** : grade couleur naturel (PAS HDR/CGI), 35mm, palette automne boréal (charred-black, crème, vert-sapin, turquoise fjord, sunset/ambre). Personnes (activités/médaillons) : anonymes, tenues **variées** en tons terreux (ne PAS écrire « cream/earthy tones » seul → uniformise tout le monde). Forme des refuges = **capsule « stadium »** (pill horizontal, bouts arrondis, coque noire mate, baie vitrée incurvée, pilotis acier) → utiliser une photo de réf en `--image` pour la verrouiller.

---

## ✅ Fait & intégré (juin 2026)

### Carousel activités (`Carousel.tsx`) — 5 cartes
Thème « solitude / rassemblement » (intro `Activites.tsx` : « Seul, ou tous ensemble »).
1. Kayak sur le fjord — `activite-kayak.avif`
2. Randonnée des sommets — `activite-sommet.avif`
3. Via ferrata — `activite-via-ferrata.avif`
4. Terrasse en fête — `activite-terrasse.avif`
5. Le feu de minuit — `activite-veillee.avif`

### Médaillons (`Medaillons.tsx`) — 2 cartes paysage
Reformés ovales→paysage. Copy « Le jour pour soi. Le soir, ensemble. »
- `medaillon-rassemblement.avif` (banderole + booth + feu, heure bleue)
- `medaillon-feu.avif` (cercle de feu intime)

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
- **Corriger plutôt que relancer** : pour un défaut localisé, repasser sa propre sortie en `--image` avec « keep everything, change only X » coûte une génération et préserve tout le reste.
- **Compter les sujets à voix haute** dans le prompt (« exactly THREE », « exactly ONE person, no other figures ») — les formulations qualitatives (« few », « isolated ») ne sont pas respectées.
- **Interdire les bords** : « no structure may touch any edge of the frame » évite les intrusions de coin, le défaut le plus fréquent sur les plans larges.

---

## ⏳ Reste à produire

### Paysage « Le lieu » (`Lieu.tsx`)
- Path : `public/images/lieu-charlevoix.avif` — 4:5 portrait
- Vue large Charlevoix / fjord St-Laurent, heure dorée, brume volumétrique.

### Galerie ambiance (`Galerie.tsx`) — 6 images
Mix 1:1 / 3:4 / 4:5 / 16:10 : brume, bois carbonisé (macro Shou Sugi Ban), forêt boréale, fjord, vallée d'octobre, intérieur capsule.

### Vidéos (optionnel)
- `hero-loop.mp4` (loop nativement seamless, voir CLAUDE.md §2B) + mini-loops d'ambiance (brume, feuille, eau).

---

## 📦 Archive sources
`public/images/_raw/` (local, gitignoré) :
- `finals/` — sources jpg/png des AVIF live (renommées)
- `alternates/` — variantes générées non retenues (souvenirs)
- `_INDEX.md` — table source ↔ AVIF live
