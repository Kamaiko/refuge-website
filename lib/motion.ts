/**
 * Site-wide motion constants. Import these into animation primitives so reveal
 * timings stay consistent across every section.
 *
 * `expo.out` and the cinematic curve come from the design tokens already defined
 * in `app/globals.css` (`--ease-cinematic`, `--ease-soft`). Keep both sources in
 * sync if values change.
 */

/** Standard panel slide duration for overlays (Reserve, Menu, etc.). */
export const PANEL = {
  open: 0.9,
  close: 0.6,
  ease: "expo.out",
  closeEase: "expo.in",
} as const;

/** Header CTA scroll-out timings (Reserve hides during hero, reappears after). */
export const SCROLL_OUT = {
  /** Anti-jitter delay before the tween starts. */
  delay: 0.35,
  duration: 0.5,
} as const;

/** Capsules section pin behavior. */
export const CAPSULES = {
  /** Total scroll length while pinned (~6 viewports). Card 3 (the last) gets
   *  a full 1.5-unit hold so it sits clearly sticky before the noir handoff,
   *  while cards 1 and 2 get short half-unit holds (~4 ticks) per user spec. */
  stickyDuration: "+=600%",
  /** Scale reduction per stacked card (5-10%). */
  scaleStep: 0.07,
} as const;
