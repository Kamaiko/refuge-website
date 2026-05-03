/** A single refuge listed on the site.
 *  - `slug`: stable id used by the Reserve form select and by URLs.
 *  - `nom`: display name (e.g. "Brume").
 *  - `surnom`: poetic subtitle shown above the name (e.g. "Sur le promontoire").
 *  - `description`: 2-3 sentences describing the location and ambience.
 *  - `capacite` / `surface`: human-readable specs ("2-4 personnes", "46 m²").
 *  - `image`: `/public` path to the cover AVIF.
 *  - `tarifParNuit`: indicative night rate in CAD, drives the Reserve cost
 *    summary. */
export type Unite = {
  slug: string;
  nom: string;
  surnom: string;
  description: string;
  capacite: string;
  surface: string;
  image: string;
  tarifParNuit: number;
};

/** All refuges shown on the site. **Order is significant** — the Capsules
 *  section maps indexes 0/1/2 onto z-index stacking and slide-up sequencing,
 *  so reordering this array will reorder the scroll-pinned slideshow. */
export const UNITES: Unite[] = [
  {
    slug: "brume",
    nom: "Brume",
    surnom: "Sur le promontoire",
    description:
      "Le plus haut, le plus exposé au ciel. Aux premières heures, la brume s’élève du fleuve et passe sous le refuge. Aurores boréales possibles l’hiver.",
    capacite: "2-4 personnes",
    surface: "46 m²",
    image: "/images/unite-brume.avif",
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
    image: "/images/unite-aubepine.avif",
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
    image: "/images/unite-galets.avif",
    tarifParNuit: 600,
  },
];
