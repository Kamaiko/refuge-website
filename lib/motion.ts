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

/** Scroll-pinned card stack on the Capsules section. */
export const CAPSULES = {
  /** Total pinned scroll length — ~6 viewports on desktop. */
  stickyDuration: "+=600%",
  /** Scale reduction per stacked card behind the active one. */
  scaleStep: 0.07,
} as const;

/** Wheel-hijacked horizontal carousel on the Vivre section. */
export const VIVRE = {
  /** Horizontal gap (in px) preserved between the leaving and arriving
   *  card during the slide travel. Negative because cards travel by
   *  `xPercent: -100` (one-card-width left); the small overlap hides any
   *  sub-pixel seam between the two rounded frames. */
  travelGapPx: -12,
  /** Total duration of a slide-to-slide tween. Shorter than 1.5s because
   *  `power1.inOut` (used for symmetry between forward and backward) has
   *  a soft start; at 1.5s the user perceived a "wait" before the motion
   *  kicked in. 1.2s keeps the inOut symmetry while still feeling reactive. */
  transitionDuration: 1.2,
  /** Wait after `onComplete` of a tween before the next wheel tick can fire
   *  the next slide. Tiny — just enough to absorb the residual wheel events
   *  that trail a single trackpad gesture. */
  cooldownMs: 50,
  /** Delay between the outgoing text's `play=false` and the incoming text's
   *  `play=true` during the slide 2 → 3 swap. Picks up where RevealChars's
   *  reverse-out finishes (≈ duration*0.5 + char_count*stagger*0.5). */
  textSwapDelayMs: 700,
  /** Ease used by every movement tween in the carousel — the only family
   *  that's mirror-symmetric, so forward and backward play feel identical. */
  ease: "power1.inOut",
} as const;
