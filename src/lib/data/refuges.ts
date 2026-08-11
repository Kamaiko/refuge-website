/** All refuges shown on the site. Each entry's shape:
 *  - `slug`: stable id used by the Reserve form select and by URLs.
 *  - `nom`: display name (e.g. "Brume").
 *  - `surnom`: poetic subtitle shown above the name (e.g. "Sur le promontoire").
 *  - `description`: 2-3 sentences describing the location and ambience.
 *  - `capacite` / `surface`: human-readable specs ("2-4 personnes", "46 m²").
 *  - `image`: `/public` path to the cover AVIF. Landscape, ~16:9.
 *  - `imagePortrait`: **optional** 9:16 variant, served below `md` by the
 *    `<picture>` in Hebergements. The cards are `absolute inset-0` inside a
 *    `~100lvh` container, so on a 390x844 phone the frame ratio is ~0.45 and
 *    a 16:9 source loses most of its width to the crop. Optional on purpose:
 *    each portrait is a separate generation, and a refuge without one simply
 *    keeps serving its landscape everywhere — no broken state, and adding one
 *    later is a single line here.
 *  - `tarifParNuit`: indicative night rate in CAD, drives the Reserve cost
 *    summary.
 *
 *  **Order is significant** — the Hebergements section maps indexes 0/1/2
 *  onto z-index stacking and slide-up sequencing, so reordering this array
 *  will reorder the scroll-pinned slideshow.
 *
 *  Consumers keep narrowing with `(typeof REFUGES)[number]`, which now
 *  resolves through the annotation below. The annotation exists for one
 *  reason: `imagePortrait` is optional, and on a bare array literal TypeScript
 *  infers a union in which the property exists on some members only — every
 *  read of `refuge.imagePortrait` would then fail to compile. */
type Refuge = {
  slug: string;
  nom: string;
  surnom: string;
  description: string;
  capacite: string;
  surface: string;
  image: string;
  imagePortrait?: string;
  tarifParNuit: number;
};

export const REFUGES: Refuge[] = [
  {
    slug: "brume",
    nom: "Brume",
    surnom: "Sur le promontoire",
    description:
      "Le plus haut, le plus exposé au ciel. Aux premières heures, la brume s’élève du fleuve et passe sous le refuge. Aurores boréales possibles l’hiver.",
    capacite: "2-4 personnes",
    surface: "46 m²",
    image: "/images/refuges/brume.avif",
    imagePortrait: "/images/refuges/brume-portrait.avif",
    tarifParNuit: 680,
  },
  {
    slug: "aubepine",
    nom: "Aubépine",
    surnom: "Au creux de la forêt",
    description:
      "Le plus enclavé des trois. Aucun voisin, aucune vue ouverte ; seulement les arbres, le bois noir et le silence. Pour celles et ceux qui viennent vraiment écouter.",
    capacite: "2 personnes",
    surface: "32 m²",
    image: "/images/refuges/aubepine.avif",
    tarifParNuit: 540,
  },
  {
    slug: "galets",
    nom: "Galets",
    surnom: "Au bord du fleuve",
    description:
      "Le refuge le plus exposé. La marée, le vent, la lumière qui change toute la journée. Les bélugas passent l’été, parfois.",
    capacite: "2-3 personnes",
    surface: "38 m²",
    image: "/images/refuges/galets.avif",
    tarifParNuit: 600,
  },
];
