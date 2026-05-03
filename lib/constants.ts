/** Brand wordmark — rebrand-safe single source of truth.
 *  - `name`: bare brand name. Used by `<BrandMark>` (which appends a styled
 *    superscript ® separately) and the HTML `<title>`.
 *  - `brandMark`: brand name + ® inline as one string — for prose, marquees,
 *    and nav labels where the ® reads as part of the word. */
export const SITE_CONFIG = {
  name: "Aquilon",
  brandMark: "Aquilon®",
} as const;
