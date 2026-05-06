/** Shared GSAP animation constants. Easings mirror `--ease-cinematic` /
 *  `--ease-soft` in globals.css — keep both sides in sync. */

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
  /** Total pinned scroll length — ~6 viewports on desktop. */
  stickyDuration: "+=600%",
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
