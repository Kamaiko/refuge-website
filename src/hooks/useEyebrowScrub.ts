"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

/**
 * Scroll-scrubbed fade-and-rise for a section's eyebrow line.
 *
 * The element is expected to ship pre-hidden with an inline `opacity: 0`,
 * so there's no flash between SSR and the moment ScrollTrigger applies its
 * `from` state. This hook is what brings it back — including under reduced
 * motion, where it snaps to the rest position instead of scrubbing.
 *
 * Extracted because Choisir, Activités and the Cta each carried a byte-for-
 * byte copy of this block; only the ref name differed. The markup they wrap
 * it around is genuinely different (Choisir and Activités use a `<p>`, the
 * Cta uses its `<h2>`), which is why this is a hook rather than a component.
 */
export function useEyebrowScrub(
  ref: RefObject<HTMLElement | null>,
  scope: RefObject<HTMLElement | null>,
) {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              end: "top 45%",
              scrub: true,
            },
          },
        );
      });

      // Not optional: the element ships at `opacity: 0`, so without this
      // branch a reduced-motion visitor never sees the eyebrow at all.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(el, { opacity: 1, y: 0 });
      });

      return () => mm.revert();
    },
    { scope },
  );
}
