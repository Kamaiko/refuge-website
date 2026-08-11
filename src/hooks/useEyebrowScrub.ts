"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { RefObject } from "react";

/**
 * Scroll-scrubbed fade-and-rise for a section's eyebrow line.
 *
 * The element is expected to carry `data-anim="fade"`, which hides it only
 * under `prefers-reduced-motion: no-preference` (see globals.css) — so there's
 * no flash between SSR and the moment ScrollTrigger applies its `from` state,
 * and a reduced-motion visitor is never hidden to begin with. That's why there
 * is no `reduce` branch here: it used to exist solely to undo an inline
 * `opacity: 0` that the markup no longer carries.
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

      return () => mm.revert();
    },
    { scope },
  );
}
