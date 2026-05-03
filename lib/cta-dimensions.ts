/** Geometry of the floating header CTAs (Réserver pill + Menu pill).
 *  Three viewport tiers: tiny (< xs), mobile (< md), desktop (>= md).
 *
 *  Two consumers:
 *  - {@link ../components/layout/Header} drives state-based sizing of the
 *    pills from these values (height/padding tweened by GSAP).
 *  - {@link ../components/common/MenuOverlay} reads them in `getClosedRect()`
 *    to compute the rect the menu box collapses back to on close. The
 *    overlay's collapse origin must match the Menu CTA's actual footprint
 *    or the close animation lands off its anchor.
 *
 *  Keep this in sync with {@link ./breakpoints} — the tier names map onto
 *  `belowXs` / `belowMd` / `mdUp`. */
export const CTA = {
  /** Outer cream pill height (px). */
  pillH: { tiny: 48, mobile: 60, desktop: 84 },
  /** Inner gris-tan circle height (px). */
  circleH: { tiny: 42, mobile: 52, desktop: 74 },
  /** Distance from viewport bottom to the Menu CTA (px). */
  bottom: { tiny: 32, mobile: 48, desktop: 48 },
  /** Approximate width of the Menu CTA at rest (label + circle + paddings).
   *  Used by the MenuOverlay collapse origin only — the actual button width
   *  is content-driven. */
  width: { mobile: 130, desktop: 160 },
  /** Cream margin past the inner circle on the right edge of the pill (px). */
  pillPaddingRight: 4,
} as const;
