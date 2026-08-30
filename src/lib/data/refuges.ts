/** All refuges shown on the site. Each entry's shape:
 *  - `slug`: stable id used by the Reserve form select and by URLs.
 *  - `nom`: display name (e.g. "Brume").
 *  - `surnom`: poetic subtitle shown above the name (e.g. "Sur le promontoire").
 *  - `description`: 2-3 sentences describing the location and ambience.
 *  - `capacite` / `surface`: human-readable specs ("2-4 personnes", "46 m²").
 *  - `image`: `/public` path to the cover AVIF. Landscape, ~16:9.
 *  - `imagePortrait`: **required** 9:16 variant, served below `md` by the
 *    `<picture>` in Hebergements. The cards are `absolute inset-0` inside a
 *    `~100lvh` container, so on a 390x844 phone the frame ratio is ~0.45 and
 *    a 16:9 source loses ~75% of its width to the crop — silently, with no
 *    error and nothing in the console.
 *    ⚠️ It was optional until 2026-08-30, back when only Brume had one. Once
 *    all three were generated, the two fallbacks it justified in Hebergements
 *    (`imagePortrait && <source>` and `?? refuge.image`) became branches no
 *    data could reach — untested code that would fail unnoticed. Requiring
 *    the field deleted both, and now a fourth refuge cannot ship without its
 *    portrait: the build stops instead of the phone quietly cropping it.
 *  - `tarifParNuit`: indicative night rate in CAD, drives the Reserve cost
 *    summary.
 *
 *  **Order is significant** — the Hebergements section maps indexes 0/1/2
 *  onto z-index stacking and slide-up sequencing, so reordering this array
 *  will reorder the scroll-pinned slideshow.
 *
 *  Consumers keep narrowing with `(typeof REFUGES)[number]`. The `Refuge[]`
 *  annotation below is what they resolve through; it also makes a missing
 *  field a compile error at the literal, which is the whole point now that
 *  every field is required. */
type Refuge = {
  slug: string;
  nom: string;
  surnom: string;
  description: string;
  capacite: string;
  surface: string;
  image: string;
  imagePortrait: string;
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
    surnom: "Sur le cap doré",
    description:
      "Posé sur un éperon d’herbes sèches, face au couchant. Les caps s’enfoncent dans la lumière l’un derrière l’autre, et les cargos passent si loin qu’on ne les entend pas.",
    capacite: "2 personnes",
    surface: "32 m²",
    image: "/images/refuges/aubepine.avif",
    imagePortrait: "/images/refuges/aubepine-portrait.avif",
    tarifParNuit: 540,
  },
  {
    slug: "galets",
    nom: "Galets",
    // ⚠️ Le nom vient de la grève EN CONTREBAS, pas de l'emplacement du
    // refuge. Deux versions successives l'ont oublié et ont écrit que Galets
    // était « au bord du fleuve », puis « le plus bas des trois, presque au
    // niveau de l'eau » — sa photo le montre en haut d'une falaise. Toute
    // reformulation doit garder la grève à distance, en dessous.
    surnom: "Au-dessus de la grève",
    description:
      // ⚠️ Ne pas réintroduire de cycle de marée « le matin / le soir » :
      // l'estuaire est semi-diurne (deux marées hautes par jour), et la carte
      // « dans six heures » du Carousel le dit correctement. Les deux textes
      // sont sur le même scroll, donc ils se contredisaient à voix haute.
      "Le fleuve s’ouvre en grand, et la grève de galets attend en contrebas. Le vent monte de l’eau tout le jour, puis tombe d’un coup au crépuscule.",
    capacite: "2-3 personnes",
    surface: "38 m²",
    image: "/images/refuges/galets.avif",
    imagePortrait: "/images/refuges/galets-portrait.avif",
    tarifParNuit: 600,
  },
];
