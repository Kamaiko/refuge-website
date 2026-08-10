"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SITE_CONFIG } from "@/lib/constants";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

/** Footer-specific Aquilon wordmark reveal. Distinct from the shared
 *  {@link RevealChars} primitive (used by Hebergements + Pourquoi) so the
 *  Footer animation can iterate independently.
 *
 *  The reveal combines a `clip-path` wipe — `inset(0 0 0 100% → 0%)`, so
 *  each letter's visible region grows from its right edge leftward, like an
 *  invisible curtain passing right→left across the glyph — with a small
 *  same-direction slide as a secondary flourish.
 *
 *  No painted curtain element: the reveal clips the glyph itself, so
 *  nothing is rendered that could leave a visible silhouette around the
 *  wordmark at rest. (The earlier DOM-curtain approach produced a faint
 *  per-glyph rectangle outline against the surrounding background, visible
 *  even when the colours matched.)
 *
 *  This used to expose `slide` / `wipe` / `wipe-and-slide` modes for A/B/C
 *  testing. `wipe-and-slide` won and the other two branches were never
 *  used by any call site, so the `mode` prop is gone. */

const CLIP_HIDDEN = "inset(0% 0% 0% 100%)";
const CLIP_REVEALED = "inset(0% 0% 0% 0%)";

/** Glyph x-offset at rest, as a percentage of its own width. Deliberately
 *  well short of a full 110 (which is what {@link RevealChars} uses) —
 *  here the clip-path wipe carries the reveal and the slide only adds
 *  parallax underneath it. */
const SLIDE_START_X = 40;

type Props = {
  play: boolean;
  className?: string;
  charClassName?: string;
  ease?: string;
  duration?: number;
};

export default function AquilonReveal({
  play,
  className,
  charClassName,
  ease = "power2.inOut",
  duration = 1.0,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Park glyphs in their hidden state on mount, then reveal the root.
  // Without this, the first frame would flash the natural-position text
  // before the play effect pulled it back.
  //
  // Under reduced motion we park them REVEALED instead: the wrapper ships
  // with `visibility: hidden` inline, so anything that leaves the glyphs
  // clipped would render the footer wordmark permanently invisible.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const glyphs = root.querySelectorAll<HTMLElement>(".rc-glyph");
    gsap.set(glyphs, {
      xPercent: prefersReducedMotion ? 0 : SLIDE_START_X,
      clipPath: prefersReducedMotion ? CLIP_REVEALED : CLIP_HIDDEN,
    });
    gsap.set(root, { visibility: "visible" });
  }, [prefersReducedMotion]);

  // Drive forward / reverse on play change. Reverse uses half-duration so a
  // quick scroll-up-then-down feels responsive instead of waiting out a
  // full reverse tween.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    // At rest and staying there — the effect above already revealed it.
    if (prefersReducedMotion) return;
    const glyphs = root.querySelectorAll<HTMLElement>(".rc-glyph");
    gsap.to(glyphs, {
      xPercent: play ? 0 : SLIDE_START_X,
      clipPath: play ? CLIP_REVEALED : CLIP_HIDDEN,
      duration: play ? duration : duration * 0.5,
      ease: play ? ease : "expo.out",
      overwrite: true,
    });
  }, [play, ease, duration, prefersReducedMotion]);

  const text = SITE_CONFIG.brandMark;
  return (
    <span
      ref={ref}
      className={className}
      aria-label={text}
      style={{ visibility: "hidden" }}
    >
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className={`relative inline-block overflow-hidden align-baseline ${charClassName ?? ""}`}
        >
          <span className="rc-glyph inline-block">{ch}</span>
        </span>
      ))}
    </span>
  );
}
