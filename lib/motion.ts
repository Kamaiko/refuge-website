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
