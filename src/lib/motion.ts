/** Shared GSAP animation constants and motion-preference helpers. */

/** Reads the live `prefers-reduced-motion` preference.
 *
 *  Use this inside event handlers and one-shot mount effects, where the
 *  value only needs to be correct *at call time* and re-rendering on a
 *  preference change would buy nothing. For anything that must switch
 *  **layout** when the preference flips, use the `usePrefersReducedMotion`
 *  hook in `src/hooks/useMediaQuery.ts` instead — it subscribes.
 *
 *  Browser-only: guard or call from an effect. */
export const wantsReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Open/close ease pair for the Menu and Reserve panels.
 *  Asymmetric on purpose: out-easing on entry feels welcoming,
 *  in-easing on exit feels decisive. */
export const PANEL = {
  ease: "expo.out",
  closeEase: "expo.in",
} as const;

/** Reserve CTA hide-on-scroll-down / show-on-scroll-up timing. */
export const SCROLL_OUT = {
  /** Anti-jitter delay before hide/show fires. */
  delay: 0.35,
  duration: 0.5,
} as const;

/** Scroll-pinned card stack on the Hebergements section. */
export const HEBERGEMENTS = {
  /** Total pinned scroll length. Mobile is deliberately half the desktop
   *  length: the same three cards read faster on a small screen, and a
   *  6-viewport pin on a phone feels like the page has stopped responding.
   *  Both values live here — the mobile one used to be hardcoded inline next
   *  to the desktop lookup, which is exactly how one gets tuned and the other
   *  forgotten. */
  stickyDuration: { mobile: "+=300%", desktop: "+=600%" },
  /** Scale reduction per stacked card behind the active one. */
  scaleStep: 0.07,
} as const;

/** Wheel-hijacked horizontal carousel on the Pourquoi section. */
export const POURQUOI = {
  /** Horizontal gap (in px) preserved between the leaving and arriving
   *  card during the slide travel. Negative because cards travel by
   *  `xPercent: -100` (one-card-width left); the small overlap hides any
   *  sub-pixel seam between the two rounded frames. */
  travelGapPx: -12,
  /** Total duration of a slide-to-slide tween. Tuned by feel. */
  transitionDuration: 0.9,
  /** Wait after `onComplete` of a tween before the next wheel tick can fire
   *  the next slide. Tiny — just enough to absorb the residual wheel events
   *  that trail a single trackpad gesture. */
  cooldownMs: 50,
  /** Ease used by every movement tween in the carousel — the only family
   *  that's mirror-symmetric, so forward and backward play feel identical. */
  ease: "power1.inOut",
} as const;
