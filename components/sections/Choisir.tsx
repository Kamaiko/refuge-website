"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { BgGradient } from "@/components/common/BgTransition";
import { SITE_CONFIG } from "@/lib/constants";

const LINES = ["Choisissez celui", "qui vous convient"] as const;

/** Brand pillars surfaced as a tag cloud at the bottom-right of the section.
 *  Rendered as outlined pills, alternating between a muted gris and a brighter
 *  cream variant via index parity in the map below. */
const FEATURES = [
  "Bois carbonisé",
  "Bain nordique",
  "Éco-friendly",
  "Granit de Charlevoix",
  "Verre pleine hauteur",
  "Vue ouverte",
  "Foyer intérieur",
  "Toit végétal",
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
        // Three scroll-driven effects, all sync-end at "top 15%":
        //   1. Depth   — scale + opacity ramp over the full approach.
        //   2. Parallax — y drift; title moves slower than page-scroll for a
        //                 clearly different motion axis.
        //   3. Curtain — per-line clip-path retraction, synced with parallax
        //                so the rideau finishes when the title stops drifting.
        //
        // Mobile uses a softer parallax (-75 vs -200): the eyebrow sits much
        // closer there and a deeper drift made the curtain's first reveal
        // show letter slivers straddling the eyebrow row. The curtain's start
        // % is then bumped to compensate — ScrollTrigger measures against the
        // NATURAL top, so without the bump the visual reveal point would be
        // offset upward by the in-flight parallax.
        const isMobile = window.matchMedia("(max-width: 767px)").matches;
        const parallaxY = isMobile ? -75 : -200;
        const curtainStart = isMobile ? "top 88%" : "top 60%";

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
              end: "top 15%",
              scrub: true,
            },
          },
        );

        gsap.fromTo(
          titleWrapRef.current,
          { y: parallaxY },
          {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: titleWrapRef.current,
              start: "top 60%",
              end: "top 15%",
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
                start: curtainStart,
                end: "top 15%",
                scrub: true,
              },
            },
          );
        });
      });

      // Reduced-motion: instant reveal so the copy stays readable.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        lineRefs.current.forEach((line) => {
          if (line) gsap.set(line, { clipPath: "inset(0% 0 0 0)", visibility: "visible" });
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  // Eyebrow scroll-scrub: opacity + y track scroll over a ~50svh window.
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
              end: "top 45%",
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
          className="text-creme text-xl md:text-2xl font-semibold tracking-tight"
        >
          Découvrir les refuges {SITE_CONFIG.brandMark}
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
          <p className="text-creme-terre/70 max-w-4xl text-2xl min-[390px]:text-3xl md:text-5xl font-medium leading-relaxed">
            Choisissez parmi nos trois refuges architecturaux. Chacun atteint les plus hauts standards et s&apos;ajuste à votre rythme. Prenez celui qui vous parle.
          </p>

          <div className="flex flex-col gap-8">
            <p className="text-creme text-xl md:text-2xl font-semibold tracking-tight leading-snug max-w-md">
              Les refuges ont été construits selon les mêmes règles :
            </p>
            <ul className="flex flex-wrap gap-3" aria-label="Principes communs aux refuges">
              {FEATURES.map((f, i) => (
                <li
                  key={f}
                  className={`inline-flex items-center rounded-pill border-[2px] md:border-[3px] px-5 md:px-10 py-2.5 md:py-5 text-sm md:text-xl ${
                    i % 2 === 0
                      ? "border-creme-terre/70 text-creme-terre"
                      : "border-white/50 text-white"
                  }`}
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
