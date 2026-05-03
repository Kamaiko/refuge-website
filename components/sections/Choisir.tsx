"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { BgGradient } from "@/components/common/BgTransition";

const LINES = ["Choisissez celui", "qui vous rejoint"] as const;

/** Transition section before the Capsules slideshow. The headline triggers
 *  three synchronised scroll-scrubbed effects (depth scale + opacity ramp,
 *  parallax y-drift slower than page scroll, per-line clip-path curtain).
 *  A {@link BgGradient} fades from `--color-base-noir` into the gris-tan
 *  background so the section seams cleanly into Capsules below.
 *  Reduced-motion: lines are revealed instantly, no scroll-driven motion. */
export default function Choisir() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleWrapRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      if (!titleWrapRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Three scroll-driven effects, all sync-end at "top 25%":
        //   1. Depth   — scale + opacity ramp over the full approach.
        //   2. Parallax — y drift, ~1.7× slower than page-scroll (negative y
        //                 avoids overlapping the description below).
        //   3. Curtain — per-line clip-path retraction (mask lifts upward).
        lineRefs.current.forEach((line) => {
          if (line) gsap.set(line, { clipPath: "inset(100% 0 0 0)", visibility: "visible" });
        });

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
      });

      // Reduced-motion fallback: skip every scroll-driven effect, just
      // reveal the lines instantly so the copy stays readable.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        lineRefs.current.forEach((line) => {
          if (line) gsap.set(line, { clipPath: "inset(0% 0 0 0)", visibility: "visible" });
        });
      });

      return () => mm.revert();
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
            Découvrir les refuges Aquilon<sup className="text-[0.65em]">®</sup>
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
                // clip-path owned by GSAP (fromTo `from` block sets it before
                // first paint after hydration). visibility:hidden prevents an
                // SSR flash without colliding with GSAP's transform/clip writes.
                style={{ visibility: "hidden" }}
                className="block"
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
