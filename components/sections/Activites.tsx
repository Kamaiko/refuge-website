"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { MQ } from "@/lib/breakpoints";
import BgGradient from "@/components/common/BgGradient";

const LINES = ["Découvrez les activités", "du fjord"] as const;

/** Three commitment tiers shown as labelled progress bars below the title.
 *  `fill` is a 0..1 fraction — the bar's filled length relative to the
 *  full track width. Hand-picked to read as a soft ascending pattern
 *  (33% / 66% / 100%), not literal duration ratios. */
const NIVEAUX = [
  { label: "Demi-journée", duration: "3–5h", fill: 0.33 },
  { label: "Journée", duration: "8–12h", fill: 0.66 },
  { label: "Multijour", duration: "24h+", fill: 1.0 },
] as const;

/**
 * "Découvrez les activités du fjord" — editorial typo-only section that
 * mirrors the {@link Choisir} animation pattern (scroll-scrubbed depth +
 * parallax + per-line clip-path curtain). Bottom block is a 2-column grid
 * on desktop : NIVEAUX progress bars on the left, descriptive paragraph
 * on the right.
 *
 * Reduced-motion : lines reveal at rest, no scroll-driven motion.
 */
export default function Activites() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleWrapRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (!titleWrapRef.current) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          // `isDesktop` is load-bearing for matchMedia — without it, the
          // desktop viewport matches no declared condition and the callback
          // never runs, leaving the title clipped invisible. Same convention
          // used in Choisir.
          isMobile: `(prefers-reduced-motion: no-preference) and ${MQ.belowMd}`,
          isDesktop: `(prefers-reduced-motion: no-preference) and ${MQ.mdUp}`,
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { isMobile, reduceMotion } = ctx.conditions as {
            isMobile: boolean;
            isDesktop: boolean;
            reduceMotion: boolean;
          };

          if (reduceMotion) {
            lineRefs.current.forEach((line) => {
              if (line) gsap.set(line, { clipPath: "inset(0% 0 0 0)", visibility: "visible" });
            });
            return;
          }

          // Mobile parallax is softer (-75 vs -200) for the same reason as
          // Choisir : the eyebrow row sits closer to the title and a deeper
          // drift makes the curtain reveal show letter slivers above the
          // intended start line.
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
        },
      );

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  // Eyebrow scrub : opacity + y track scroll progress over a ~50svh window.
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
    <section ref={sectionRef} className="relative w-full bg-base-noir">
      {/* Background gradient kicks in BELOW the title — the top half of
          the section stays bg-base-noir so the eyebrow + title sit on
          pure black, then a base-noir → gris-tan blend takes over for
          the niveaux list + paragraph rail. The gris-tan continues into
          the Carousel below (which has bg-gris-tan), forming one warm
          band of section before snapping back to base-noir at Feedback. */}
      <BgGradient
        from="var(--color-base-noir)"
        to="var(--color-gris-tan)"
        direction="down"
        className="top-[50%]"
      />

      {/* Single padding scope shared by eyebrow + title + footer — every
          block reads as one composed page, not three differently-inset
          blocks. Matches Choisir exactly. */}
      <div className="relative px-8 md:px-16 py-32 md:py-48">
        <p
          ref={eyebrowRef}
          // Pre-hidden via inline style so there's no SSR flash before the
          // scrub `from` state applies after hydration.
          style={{ opacity: 0 }}
          className="text-creme text-xl md:text-2xl font-semibold tracking-tight"
        >
          Le territoire, à votre rythme
        </p>

        <div ref={titleWrapRef} className="mt-16 md:mt-24 will-change-transform">
          <h2 className="text-creme text-[11vw] md:text-[10vw] font-medium leading-[0.95] tracking-[-0.045em]">
            {LINES.map((line, i) => (
              <span
                key={i}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                // clip-path owned by GSAP; visibility:hidden prevents an SSR
                // flash; pb-[0.1em] extends the line-box past descenders so
                // the clip doesn't trim "j", "p", "q".
                style={{ visibility: "hidden" }}
                className="block pb-[0.1em]"
              >
                {line}
              </span>
            ))}
          </h2>
        </div>

        <div className="mt-16 md:mt-32 grid gap-12 md:grid-cols-2 md:gap-16 items-start">
          {/* Niveaux list (left column desktop). Each row : label + duration
              on the same baseline, then a track underline whose fill width
              maps to NIVEAUX[i].fill. */}
          <ul className="flex flex-col gap-8 md:gap-12">
            {NIVEAUX.map((n) => (
              <li key={n.label} className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-creme text-xl md:text-2xl font-medium tracking-tight">
                    {n.label}
                  </span>
                  <span className="text-creme-terre/70 text-sm md:text-base font-medium tracking-wide">
                    {n.duration}
                  </span>
                </div>
                {/* Track + fill. The track is the dim border; the fill is
                    an absolutely-positioned bar whose width is the inline
                    percentage. Both use the same border-bottom thickness
                    so the unfilled portion visually persists. */}
                <div className="relative h-px w-full bg-creme-dim/25">
                  <span
                    aria-hidden
                    style={{ width: `${Math.round(n.fill * 100)}%` }}
                    className="absolute inset-y-0 left-0 bg-creme-terre"
                  />
                </div>
              </li>
            ))}
          </ul>

          <p className="text-creme-terre/70 max-w-xl text-base md:text-2xl font-medium leading-snug">
            On peut sortir une heure ou disparaître deux jours. Le territoire ne s&apos;impose pas — il propose. Chaque activité se choisit comme on choisit la lumière du moment : par envie, pas par programme.
          </p>
        </div>
      </div>
    </section>
  );
}
