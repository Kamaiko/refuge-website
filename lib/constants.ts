/** Single source of truth for the brand identity strings rendered across
 *  the site (header wordmark, hero copy, page metadata).
 *
 *  - `name`: bare brand name — used by `<BrandMark>` (which appends a styled
 *    ® separately) and metadata that doesn't want the trademark glyph inline.
 *  - `brandMark`: brand name + ® inline as a single string — for prose, marquee
 *    text, nav labels, and any context where the ® reads as part of the word
 *    (not as the styled superscript that `<BrandMark>` produces).
 *  - `heroTagline`: poetic two-line tagline (`\n` is rendered as a line
 *    break via `whitespace-pre-line`).
 *  - `heroSubcopy`: short positioning line under the tagline.
 *  - `locale`: BCP-47 locale used for date/number formatting.
 *  - `url`: canonical site URL — used by future SEO/OG metadata.
 */
export const SITE_CONFIG = {
  name: "Aquilon",
  brandMark: "Aquilon®",
  heroTagline: "Trois refuges\nau creux du fjord.",
  heroSubcopy:
    "Passer du temps de qualité dans nos emplacements au Québec avec — Aquilon®.",
  locale: "fr-CA",
  url: "https://refuges-charlevoix.local",
} as const;
