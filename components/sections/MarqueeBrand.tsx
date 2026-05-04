"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import Marquee from "@/components/common/Marquee";
import { SITE_CONFIG } from "@/lib/constants";

/** Decorative banner between Capsules and Feedback: a giant directional
 *  {@link Marquee} of the brand line. Aria-hidden — pure visual flourish.
 *
 *  Scroll-driven Y parallax (±150px over the section's full visible range)
 *  makes the ribbon read as if it lives on a different axis from the page
 *  beneath it — the ribbon drifts down ~20% slower than the page-scroll
 *  rate. Skipped under prefers-reduced-motion. */
export default function MarqueeBrand() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!sectionRef.current) return;
        gsap.fromTo(
          sectionRef.current,
          { y: 0 },
          {
            y: 240,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-hidden
      className="relative w-full overflow-hidden pt-24 md:pt-32 pb-0 select-none bg-base-noir will-change-transform"
    >
      <Marquee
        text={`Pourquoi ${SITE_CONFIG.brandMark} ?`}
        speed={260}
        mobileSpeed={80}
        separator="·"
        directional
        scrollBoost
        className="text-creme/90 text-[24vw] md:text-[14vw] font-semibold leading-none tracking-[-0.04em]"
      />
    </section>
  );
}
