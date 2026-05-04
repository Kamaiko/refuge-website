"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { MQ } from "@/lib/breakpoints";
import Marquee from "@/components/common/Marquee";
import { SITE_CONFIG } from "@/lib/constants";

/** Decorative banner between Capsules and Feedback: a giant directional
 *  {@link Marquee} of the brand line. Aria-hidden — pure visual flourish.
 *
 *  Scroll-driven Y parallax (desktop only): the ribbon translates down
 *  so that, by the time Capsules has taken over the upper viewport, the
 *  ribbon's text is pushed below the section's `overflow-hidden` clip.
 *  On mobile the section is too short for any travel to fit — `pt-16 +
 *  text-[24vw]` lands around ~160 px, which means even a 100 px parallax
 *  drives the text fully out of frame. Skipped on mobile and under
 *  reduced-motion; the text stays put and remains visible. */
const PARALLAX_Y = 360;

export default function MarqueeBrand() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`(prefers-reduced-motion: no-preference) and ${MQ.mdUp}`, () => {
        if (!sectionRef.current) return;
        gsap.fromTo(
          sectionRef.current,
          { y: 0 },
          {
            y: PARALLAX_Y,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 50%",
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
      className="relative w-full overflow-hidden pt-16 md:pt-20 pb-0 select-none bg-base-noir will-change-transform"
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
