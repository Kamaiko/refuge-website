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

### Pourquoi (`Pourquoi.tsx`) — 3 slides (4:5)
- `pourquoi-matin.avif` — prendre son temps (intérieur café/livre)
- `pourquoi-baie.avif` — grande baie vitrée (intérieur moderne walnut/noir/plantes)
- `pourquoi-drone.avif` — intimité/isolement (drone « éventail sur la crête » : capsules face au fjord, espacées)

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
