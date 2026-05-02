/**
 * Site-wide motion constants. Import these into animation primitives so reveal
 * timings stay consistent across every section.
 *
 * `expo.out` and the cinematic curve come from the design tokens already defined
 * in `app/globals.css` (`--ease-cinematic`, `--ease-soft`). Keep both sources in
 * sync if values change.
 *
 * See `docs/Design.md` § 4 for usage rules.
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

/** Header CTA scroll-out timings (Reserve hides during hero, reappears after). */
export const SCROLL_OUT = {
  /** Anti-jitter delay before the tween starts. */
  delay: 0.35,
  duration: 0.5,
} as const;

/** Marquee behavior — constant speed, direction switch on viewport threshold. */
export const MARQUEE = {
  /** Pixels per second, constant (no scroll-driven acceleration). */
  speedBase: 80,
  /** Viewport threshold (0-1) for direction switch. 0.2 = section ≥20% in view. */
  threshold: 0.2,
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
