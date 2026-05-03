"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { BgGradient } from "@/components/common/BgTransition";

const LINES = ["Choisissez celui", "qui vous rejoint"] as const;

/** Brand pillars surfaced as a tag cloud at the bottom-right of the section.
 *  All rendered as outlined gris pills on the section's gris-tan background. */
const FEATURES = [
  "Bois carbonisé",
  "Solitaire",
  "Boréal",
  "Architecture lente",
  "Sauna nordique",
  "Vue ouverte",
] as const;

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
  const eyebrowRef = useRef<HTMLParagraphElement>(null);

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

  // Eyebrow fade — scroll-scrubbed: opacity + y track the scroll position
  // continuously over a ~50svh window so the reveal feels tied to the
  // user's scroll, not a one-shot animation. Kept in its own useGSAP so
  // it doesn't depend on the title's early-return guard (titleWrapRef).
  useGSAP(
    () => {
      if (!eyebrowRef.current) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          eyebrowRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: eyebrowRef.current,
              start: "top 80%",
              end: "top 30%",
              scrub: true,
            },
          },
        );
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (eyebrowRef.current) gsap.set(eyebrowRef.current, { opacity: 1, y: 0 });
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

      {/* Single padding scope (px-8 md:px-16) for every block — eyebrow,
          headline, and the two-column footer all share the same left edge,
          so the content reads as one composed page rather than three
          differently-inset blocks. */}
      <div className="relative px-8 md:px-16 py-32 md:py-48">
        <p
          ref={eyebrowRef}
          // Pre-hidden via inline style so there's no SSR flash before
          // GSAP's ScrollTrigger applies its own `from` state on init.
          style={{ opacity: 0 }}
          className="text-creme text-lg md:text-xl font-semibold tracking-tight"
        >
          Découvrir les refuges Aquilon®
        </p>

        <div ref={titleWrapRef} className="mt-16 md:mt-24 will-change-transform">
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
                // pb-[0.1em] extends the line-box below the typographic
                // descenders so the clip-path doesn't trim "j", "p", "q", etc.
                // (CSS spec disallows negative `inset()` values that would
                // otherwise let the clip extend past the box).
                style={{ visibility: "hidden" }}
                className="block pb-[0.1em]"
              >
                {line}
              </span>
            ))}
          </h2>
        </div>

        <div className="mt-16 md:mt-32 grid gap-12 md:grid-cols-2 md:gap-16">
          <p className="text-creme-terre/70 max-w-md text-lg md:text-2xl font-medium leading-relaxed">
            On les a posés à des distances précises. Chacun ouvre sur quelque chose qu&apos;aucun autre ne voit.
          </p>

          <div className="flex flex-col gap-8">
            <p className="text-creme text-base md:text-lg font-semibold leading-snug max-w-md">
              Trois refuges Aquilon<sup className="text-[0.65em]">®</sup> — mêmes principes,
              <br />
              trois solitudes :
            </p>
            <ul className="flex flex-wrap gap-3" aria-label="Principes communs aux refuges">
              {FEATURES.map((f) => (
                <li
                  key={f}
                  className="inline-flex items-center rounded-pill border border-gris-secondaire/50 text-creme-dim px-6 md:px-8 py-3 md:py-4 text-base md:text-lg"
                >
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
