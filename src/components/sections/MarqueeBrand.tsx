"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { MQ } from "@/lib/breakpoints";
import Marquee from "@/components/common/Marquee";
import { SITE_CONFIG } from "@/lib/constants";

/** Decorative banner between Hebergements and Pourquoi: a giant directional
 *  {@link Marquee} of the brand line. Aria-hidden — pure visual flourish.
 *
 *  Scroll-driven Y parallax with per-viewport magnitudes — the ribbon
 *  translates down so it drifts below the section's `overflow-hidden`
 *  clip by the time the next section takes over. The travel must stay
 *  ≤ `(section_height - text_height)` or the text is pushed out of
 *  frame immediately. Mobile section is far shorter (`pt-16 +
 *  text-[24vw]` ≈ 160 px), so it gets a much smaller travel.
 *  Skipped under reduced-motion. */
const PARALLAX_Y = { mobile: 100, desktop: 360 } as const;

export default function MarqueeBrand() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      const buildParallax = (yTo: number) => {
        if (!sectionRef.current) return;
        gsap.fromTo(
          sectionRef.current,
          { y: 0 },
          {
            y: yTo,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 50%",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      };

      mm.add(`(prefers-reduced-motion: no-preference) and ${MQ.mdUp}`, () => {
        buildParallax(PARALLAX_Y.desktop);
      });
      mm.add(`(prefers-reduced-motion: no-preference) and ${MQ.belowMd}`, () => {
        buildParallax(PARALLAX_Y.mobile);
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-hidden
      className="relative w-full overflow-hidden pt-16 md:pt-20 pb-0 select-none bg-base-noir will-change-transform"
    >
      <Marquee
        text={`Pourquoi ${SITE_CONFIG.brandMark} ?`}
        speed={260}
        mobileSpeed={80}
        separator="·"
        directional
        scrollBoost
        className="text-creme/90 text-[24vw] md:text-[12vw] font-semibold leading-none tracking-[-0.04em]"
      />
    </section>
  );
}
