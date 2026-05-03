/** Single source of truth for the brand identity strings rendered across
 *  the site (header wordmark, hero copy, page metadata).
 *
 *  - `name`: full brand name (e.g. used by `<BrandMark>` and metadata).
 *  - `brandMark`: monogram for the small top-left logo pill.
 *  - `heroTagline`: poetic two-line tagline (`\n` is rendered as a line
 *    break via `whitespace-pre-line`).
 *  - `heroSubcopy`: short positioning line under the tagline.
 *  - `locale`: BCP-47 locale used for date/number formatting.
 *  - `url`: canonical site URL — used by future SEO/OG metadata.
 */
export const SITE_CONFIG = {
  name: "Aquilon",
  brandMark: "A",
  heroTagline: "Trois silences\nau creux du fjord.",
  heroSubcopy:
    "Passer du temps de qualité dans nos emplacements au Québec avec — Aquilon®.",
  locale: "fr-CA",
  url: "https://refuges-charlevoix.local",
} as const;
