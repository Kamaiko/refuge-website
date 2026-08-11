"use client";

import { useRef } from "react";

import BgGradient from "@/components/common/BgGradient";
import SectionHeading from "@/components/common/SectionHeading";

const LINES = ["Découvrez les", "activités du territoire"] as const;

/** Below `lg`, "activités du territoire" no longer fits on one line — and the
 *  curtain animates per ENTRY, so a wrapped entry would reveal both of its
 *  visual lines at once instead of in sequence. Splitting it explicitly keeps
 *  one curtain per line at every width, without touching the two-line desktop
 *  composition that mirrors Choisir. */
const LINES_COMPACT = ["Découvrez les", "activités du", "territoire"] as const;

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
 * "Découvrez les activités du territoire" — editorial typo-only section that
 * mirrors the {@link Choisir} animation pattern (scroll-scrubbed depth +
 * parallax + per-line clip-path curtain). Bottom block is a 2-column grid
 * on desktop : NIVEAUX progress bars on the left, descriptive paragraph
 * on the right.
 *
 * Reduced-motion : lines reveal at rest, no scroll-driven motion.
 */
export default function Activites() {
  const sectionRef = useRef<HTMLElement>(null);

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
        <SectionHeading
          eyebrow="Seul, ou tous ensemble"
          lines={LINES}
          linesCompact={LINES_COMPACT}
        />

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

          <p className="text-creme-terre/70 max-w-xl text-xl md:text-3xl font-medium leading-snug">
            Se retirer seul au sommet, ou rester tard autour du feu. Le territoire ne choisit pas pour vous — il offre les deux : le silence quand on le cherche, la fête quand elle se présente. Tout se vit par envie, jamais par programme.
          </p>
        </div>
      </div>
    </section>
  );
}
