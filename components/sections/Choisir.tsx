"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { BgGradient } from "@/components/common/BgTransition";

const LINES = ["Choisissez celui", "qui vous attend"] as const;

export default function Choisir() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleWrapRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      if (!titleWrapRef.current) return;

      // Two ScrollTriggers with separate ranges so the curtain doesn't fire
      // while the second line is still scrolling into view from below:
      //  1. Parallax — title shifts up 120px → 0 over the full approach,
      //     giving the slower-than-page feel.
      //  2. Curtain rise — clip-path inset(100%) → inset(0%) on each line.
      //     Starts only at "bottom 85%" (title's bottom 15% above viewport
      //     bottom = entire 2-line block fully visible with clearance for
      //     the parallax offset). Bottom of glyphs appears first, tops last.
      // Depth (subtle visual recession) — runs over the full approach.
      gsap.fromTo(
        titleWrapRef.current,
        { scale: 0.94, opacity: 0.5 },
        {
          scale: 1,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: titleWrapRef.current,
            start: "top bottom",
            end: "top 25%",
            scrub: true,
          },
        },
      );

      // Parallax — text rises at ~71% of page-scroll speed (= 1.4× slower)
      // during the reveal window. Starts at y:-140 (above natural position)
      // and drifts down to 0 as the user scrolls; net visible movement is
      // smaller than the page scroll, so the text appears to lag behind.
      // Negative y avoids overlapping the description below.
      gsap.fromTo(
        titleWrapRef.current,
        { y: -200 },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: titleWrapRef.current,
            start: "top 70%",
            end: "top 25%",
            scrub: true,
          },
        },
      );

      // Curtain reveal — sync-ends at "top 25%" with the depth + parallax.
      lineRefs.current.forEach((line) => {
        if (!line) return;
        gsap.fromTo(
          line,
          { clipPath: "inset(100% 0 0 0)" },
          {
            clipPath: "inset(0% 0 0 0)",
            ease: "none",
            scrollTrigger: {
              trigger: titleWrapRef.current,
              start: "top 70%",
              end: "top 25%",
              scrub: true,
            },
          },
        );
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="choisir" className="relative w-full bg-gris-tan">
      <BgGradient
        from="var(--color-base-noir)"
        to="var(--color-gris-tan)"
        direction="down"
      />

      <div className="relative py-32 md:py-48">
        <div className="px-5 md:px-8 mx-auto w-full max-w-[1800px]">
          <p className="text-gris-secondaire text-xs uppercase tracking-[0.3em] mb-12">
            Découvrir les refuges Brume<sup className="text-[0.65em]">®</sup>
          </p>
        </div>

        <div ref={titleWrapRef} className="px-12 md:px-20 will-change-transform">
          <h2 className="text-creme text-[11vw] md:text-[10vw] font-medium leading-[0.95] tracking-[-0.045em]">
            {LINES.map((line, i) => (
              <span
                key={i}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                className="block"
                style={{ clipPath: "inset(100% 0 0 0)" }}
              >
                {line}
              </span>
            ))}
          </h2>
        </div>

        <div className="px-5 md:px-8 mx-auto w-full max-w-[1800px]">
          <p className="text-creme-dim mt-12 max-w-2xl text-lg md:text-xl leading-relaxed font-medium">
            On les a posés à des distances précises. Chacun ouvre sur quelque chose qu&apos;aucun autre ne voit.
          </p>
        </div>
      </div>
    </section>
  );
}
