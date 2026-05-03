"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Project-wide GSAP singleton. Registers ScrollTrigger once on the client
 * and sets the default ease/duration for tweens created without explicit
 * values. Always import GSAP from this module instead of `gsap` directly
 * so the plugin registration runs before any tween touches scroll-driven
 * animation.
 *
 * The `"use client"` directive above guarantees this module only ever
 * runs in the browser — no SSR guard needed.
 */
gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: "expo.out", duration: 1.2 });

export { gsap, ScrollTrigger };
