"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SITE_CONFIG } from "@/lib/constants";

/** Footer-specific Aquilon wordmark reveal. Distinct from the shared
 *  {@link RevealChars} primitive (used by Hebergements + Pourquoi) so
 *  the Footer animation can iterate independently.
 *
 *  Three modes for A/B/C testing :
 *   - `slide`         : glyph translates xPercent 110 → 0 inside a
 *                       fixed mask. Same as RevealChars baseline.
 *   - `wipe`          : a real curtain element (a span overlay)
 *                       translates right → left across the mask
 *                       (xPercent: 0 → -100). The letter behind sits
 *                       at its natural position and the curtain's
 *                       trailing edge reveals it.
 *   - `wipe-and-slide`: curtain + a small glyph slide in the same
 *                       direction (xPercent: 10 → 0). The curtain is
 *                       the primary visible motion; the slide is a
 *                       secondary cinematic flourish during the
 *                       reveal. */
export type AquilonRevealMode = "slide" | "wipe" | "wipe-and-slide";

type Props = {
  play: boolean;
  mode: AquilonRevealMode;
  className?: string;
  charClassName?: string;
  ease?: string;
  duration?: number;
};

export default function AquilonReveal({
  play,
  mode,
  className,
  charClassName,
  ease = "power2.inOut",
  duration = 1.0,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  const slideStartX = mode === "wipe-and-slide" ? 10 : 110;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const curtains = root.querySelectorAll<HTMLElement>(".aq-curtain");
    const glyphs = root.querySelectorAll<HTMLElement>(".rc-glyph");
    if (mode === "slide") {
      gsap.set(curtains, { xPercent: -100 });
      gsap.set(glyphs, { xPercent: slideStartX });
    } else if (mode === "wipe") {
      gsap.set(curtains, { xPercent: 0 });
    } else {
      gsap.set(curtains, { xPercent: 0 });
      gsap.set(glyphs, { xPercent: slideStartX });
    }
    gsap.set(root, { visibility: "visible" });
    // mode + slideStartX never change at runtime here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const curtains = root.querySelectorAll<HTMLElement>(".aq-curtain");
    const glyphs = root.querySelectorAll<HTMLElement>(".rc-glyph");
    const tweenDuration = play ? duration : duration * 0.5;
    const tweenEase = play ? ease : "expo.out";

    if (mode === "slide" || mode === "wipe-and-slide") {
      gsap.to(glyphs, {
        xPercent: play ? 0 : slideStartX,
        duration: tweenDuration,
        ease: tweenEase,
        overwrite: true,
      });
    }
    if (mode === "wipe" || mode === "wipe-and-slide") {
      gsap.to(curtains, {
        xPercent: play ? -100 : 0,
        duration: tweenDuration,
        ease: tweenEase,
        overwrite: true,
      });
    }
  }, [play, mode, ease, duration, slideStartX]);

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
          {/* Curtain overlay — a real DOM element that translates to
              uncover the glyph. `bg-gris-tan` matches the page bg in
              the footer area so the curtain blends with the
              surrounding band ; only its trailing edge is visible
              as it slides off. */}
          <span
            aria-hidden
            className="aq-curtain absolute inset-0 bg-gris-tan"
          />
        </span>
      ))}
    </span>
  );
}
