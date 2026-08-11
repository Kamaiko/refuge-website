"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { MQ } from "@/lib/breakpoints";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useEyebrowScrub } from "@/hooks/useEyebrowScrub";

type Props = {
  /** Small line above the headline. A node rather than a string so call
   *  sites can interpolate `SITE_CONFIG.brandMark`. */
  eyebrow: ReactNode;
  /** One entry per rendered line. Each gets its own curtain, so the split is
   *  a design decision, not a wrapping accident. */
  lines: readonly string[];
  /** Optional alternate split for viewports below `lg`.
   *
   *  Needed because the curtain is per ENTRY, not per rendered line: if an
   *  entry wraps, both visual lines are revealed as one block and the effect
   *  loses its stagger. "activités du territoire" fits on one line from about
   *  900px up but wraps at 768 and below, so Activités passes a three-way
   *  split here while keeping its two-line desktop composition. */
  linesCompact?: readonly string[];
};

/**
 * The eyebrow-plus-headline block shared by Choisir and Activités.
 *
 * Both sections previously carried their own copy of this: the same markup,
 * the same three scroll-scrubbed effects, and the same eyebrow scrub — about
 * 125 duplicated lines between them, of which the eyebrow block was byte-for-
 * byte identical. Changing the headline treatment meant editing two files and
 * hoping they stayed in step.
 *
 * The headline runs three scroll-driven effects, all ending together at
 * `top 15%`:
 *   1. Depth    — scale + opacity ramp across the full approach.
 *   2. Parallax — y drift; the title moves slower than page scroll, so it
 *                 reads on a different motion axis from the page itself.
 *   3. Curtain  — per-line `clip-path` retraction, synced to finish exactly
 *                 when the parallax stops drifting.
 *
 * Reduced motion: lines are revealed instantly and nothing is scroll-driven.
 */
export default function SectionHeading({ eyebrow, lines, linesCompact }: Props) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleWrapRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // SSR and the first client render return `false`, so the desktop split is
  // what hydrates. Harmless here: the lines ship `visibility: hidden` and are
  // only revealed by the curtain, so the reconciliation is never seen.
  const isCompact = useMediaQuery(MQ.belowLg);
  const renderedLines = isCompact && linesCompact ? linesCompact : lines;

  useEyebrowScrub(eyebrowRef, scopeRef);

  useGSAP(
    () => {
      if (!titleWrapRef.current) return;

      // Drop refs left over from a longer previous split. React nulls the
      // entry when a span unmounts, but trimming keeps the array's length
      // honest so nothing downstream iterates over holes.
      lineRefs.current.length = renderedLines.length;

      const mm = gsap.matchMedia();

      mm.add(
        {
          // `isDesktop` is load-bearing even though only `isMobile` is read:
          // gsap.matchMedia fires the callback only when at least one declared
          // condition matches. Drop it and desktop viewports match nothing, so
          // the animation never runs and the title stays clipped at
          // `inset(100%)` — i.e. invisible.
          isMobile: `(prefers-reduced-motion: no-preference) and ${MQ.belowMd}`,
          isDesktop: `(prefers-reduced-motion: no-preference) and ${MQ.mdUp}`,
        },
        (ctx) => {
          const { isMobile } = ctx.conditions as {
            isMobile: boolean;
            isDesktop: boolean;
          };

          // There is no `reduce` condition any more. The lines carry
          // `data-anim="hidden"`, which only applies under `no-preference`
          // (globals.css) — so under `reduce` nothing here runs and nothing
          // needs to: the title is painted by the server, unclipped.

          // Mobile uses a softer parallax (-75 vs -200): the eyebrow sits much
          // closer there, and a deeper drift made the curtain's first frames
          // show letter slivers straddling the eyebrow row. The curtain start
          // is bumped to compensate — ScrollTrigger measures against the
          // title's NATURAL top, so without the bump the visual reveal point
          // would be offset upward by the in-flight parallax.
          const parallaxY = isMobile ? -75 : -200;
          const curtainStart = isMobile ? "top 88%" : "top 60%";

          lineRefs.current.forEach((line) => {
            if (line) {
              gsap.set(line, { clipPath: "inset(100% 0 0 0)", visibility: "visible" });
            }
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
    // `renderedLines` is load-bearing in these deps. `useMediaQuery` returns
    // false on the server and the first client render, so a compact viewport
    // mounts with the desktop split and only swaps to `linesCompact` on the
    // next commit. Without a re-run, GSAP would still hold refs to the old
    // spans — and the new ones, which ship `visibility: hidden` and rely on
    // this effect to reveal them, would never appear at all. That shipped
    // once: the Activités title rendered as "Découvrez les" and nothing else.
    { scope: scopeRef, dependencies: [renderedLines] },
  );

  return (
    <div ref={scopeRef}>
      <p
        ref={eyebrowRef}
        // Pre-hidden inline so there's no SSR flash before the scrub's `from`
        // state applies after hydration. `useEyebrowScrub` owns bringing it
        // back, including under reduced motion.
        data-anim="fade"
        className="text-creme text-xl md:text-2xl font-semibold tracking-tight"
      >
        {eyebrow}
      </p>

      <div ref={titleWrapRef} className="mt-16 md:mt-24 will-change-transform">
        <h2 className="text-creme text-[11vw] md:text-[10vw] font-medium leading-[0.95] tracking-[-0.045em]">
          {renderedLines.map((line, i) => (
            <span
              key={line}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              // clip-path is owned by GSAP. `visibility: hidden` prevents an
              // SSR flash without colliding with GSAP's clip writes.
              // `pb-[0.1em]` extends the line-box below the descenders so the
              // clip doesn't trim "j", "p", "q" — the CSS spec disallows the
              // negative `inset()` values that would otherwise let the clip
              // reach past the box.
              data-anim="hidden"
              className="block pb-[0.1em]"
            >
              {line}
            </span>
          ))}
        </h2>
      </div>
    </div>
  );
}
