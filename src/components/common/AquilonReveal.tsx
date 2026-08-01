"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SITE_CONFIG } from "@/lib/constants";

/** Footer-specific Aquilon wordmark reveal. Distinct from the shared
 *  {@link RevealChars} primitive (used by Hebergements + Pourquoi) so
 *  the Footer animation can iterate independently.
 *
 *  Three modes for A/B/C testing :
 *   - `slide`         : glyph translates `xPercent: 110 → 0` inside a
 *                       fixed mask. Pure slide-in.
 *   - `wipe`          : `clip-path: inset(0 0 0 100% → 0%)` on each
 *                       glyph — visible region of the letter grows from
 *                       the right side leftward, like an invisible
 *                       curtain wiping right→left across the glyph.
 *   - `wipe-and-slide`: clip-path wipe + small same-direction glyph
 *                       slide for a subtle secondary cinematic flourish
 *                       during the reveal (tune via `slideStartX`).
 *
 *  No painted curtain element : the reveal is achieved by clipping the
 *  glyph itself, so there is nothing rendered that could create a
 *  visible silhouette around the wordmark at rest (the prior DOM
 *  curtain approach suffered from a faint per-glyph rectangle outline,
 *  visible against the surrounding bg even when colors matched). */
export type AquilonRevealMode = "slide" | "wipe" | "wipe-and-slide";

type Props = {
  play: boolean;
  mode: AquilonRevealMode;
  className?: string;
  charClassName?: string;
  ease?: string;
  duration?: number;
};

const CLIP_HIDDEN = "inset(0% 0% 0% 100%)";
const CLIP_REVEALED = "inset(0% 0% 0% 0%)";

export default function AquilonReveal({
  play,
  mode,
  className,
  charClassName,
  ease = "power2.inOut",
  duration = 1.0,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  const slideStartX = mode === "wipe-and-slide" ? 40 : 110;
  const usesSlide = mode === "slide" || mode === "wipe-and-slide";
  const usesClip = mode === "wipe" || mode === "wipe-and-slide";

  // Park glyphs in their hidden state on mount, then reveal the root.
  // Without this, the first frame would flash the natural-position
  // text before the play effect pulled it back.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const glyphs = root.querySelectorAll<HTMLElement>(".rc-glyph");
    const initial: gsap.TweenVars = {};
    if (usesSlide) initial.xPercent = slideStartX;
    if (usesClip) initial.clipPath = CLIP_HIDDEN;
    gsap.set(glyphs, initial);
    gsap.set(root, { visibility: "visible" });
    // mode + derived flags are stable per-mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drive forward / reverse on play change. Reverse uses half-duration
  // so a quick scroll-up-then-down feels responsive instead of waiting
  // for a full reverse tween to finish.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const glyphs = root.querySelectorAll<HTMLElement>(".rc-glyph");
    const target: gsap.TweenVars = {
      duration: play ? duration : duration * 0.5,
      ease: play ? ease : "expo.out",
      overwrite: true,
    };
    if (usesSlide) target.xPercent = play ? 0 : slideStartX;
    if (usesClip) target.clipPath = play ? CLIP_REVEALED : CLIP_HIDDEN;
    gsap.to(glyphs, target);
  }, [play, ease, duration, slideStartX, usesSlide, usesClip]);

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
          className={`aq-mask relative inline-block overflow-hidden align-baseline ${charClassName ?? ""}`}
        >
          <span className="rc-glyph inline-block">{ch}</span>
        </span>
      ))}
    </span>
  );
}
