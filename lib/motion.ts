/**
 * Site-wide motion constants. Import these into animation primitives so reveal
 * timings stay consistent across every section.
 *
 * `expo.out` and the cinematic curve come from the design tokens already defined
 * in `app/globals.css` (`--ease-cinematic`, `--ease-soft`). Keep both sources in
 * sync if values change.
 */

export const REVEAL = {
  /** Default duration for reveal-style animations (entrance, fade-in). */
  duration: 1.1,
  /** Default easing — strong out-curve, signature of the site. */
  ease: "expo.out",
  /** Default stagger between sibling items (lines, words, cards). */
  stagger: 0.06,
} as const;

/** Default scrub value for ScrollTrigger scrub-driven animations. */
export const SCRUB_DEFAULT = 1;

/** Standard panel slide duration for overlays (Reserve, Menu, etc.). */
export const PANEL = {
  open: 0.9,
  close: 0.6,
  ease: "expo.out",
  closeEase: "expo.in",
} as const;
