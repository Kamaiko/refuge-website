/** Shared GSAP animation constants. Easings mirror --ease-cinematic /
 *  --ease-soft in globals.css; keep both sides in sync. */

export const PANEL = {
  ease: "expo.out",
  closeEase: "expo.in",
} as const;

export const SCROLL_OUT = {
  /** Anti-jitter delay before hide/show fires. */
  delay: 0.35,
  duration: 0.5,
} as const;

export const CAPSULES = {
  /** Total pinned scroll length — ~6 viewports. */
  stickyDuration: "+=600%",
  /** Scale reduction per stacked card. */
  scaleStep: 0.07,
} as const;
