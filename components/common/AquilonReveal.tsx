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
 *   - `wipe`          : mask clip-path wipes right → left
 *                       (`inset(0% 0% 0% 100%)` → `inset(0% 0% 0% 0%)`);
 *                       glyph stays at xPercent: 0 the whole time.
 *   - `wipe-and-slide`: both happen at once — mask clip-path wipes
 *                       AND glyph translates a small distance
 *                       (xPercent 65 → 0). Most "cinematic" of the
 *                       three. */
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

  // Both clip-path stops use `%` units so GSAP can interpolate
  // between them — mixing unitless 0 with `100%` breaks the tween
  // and the wipe just pops to the final state instead of animating.
  // The 100% is on the LEFT inset (`inset(top right bottom left)`),
  // so the wipe reveals right → left as that left-clip recedes from
  // 100% to 0% — the right edge of each glyph appears first.
  const initialClip = "inset(0% 0% 0% 100%)";
  const finalClip = "inset(0% 0% 0% 0%)";
  // Positive xPercent : the glyph starts RIGHT of its natural position
  // and slides leftward into place. Same direction as the wipe-reveal
  // (right → left) so the two motions read as one cohesive entry.
  const slideStartX = mode === "wipe-and-slide" ? 65 : 110;

  // Initial state — paint the mask as fully clipped (for wipe modes)
  // or push the glyphs offscreen-right (for slide mode), then make
  // the root visible. Without this, the very first frame after mount
  // would flash the natural-position text before the play effect
  // pulls it back to its initial state.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const masks = root.querySelectorAll<HTMLElement>(".aq-mask");
    const glyphs = root.querySelectorAll<HTMLElement>(".rc-glyph");
    if (!masks.length) return;
    if (mode === "slide") {
      gsap.set(glyphs, { xPercent: slideStartX });
    } else if (mode === "wipe") {
      gsap.set(masks, { clipPath: initialClip });
    } else {
      gsap.set(masks, { clipPath: initialClip });
      gsap.set(glyphs, { xPercent: slideStartX });
    }
    gsap.set(root, { visibility: "visible" });
    // mode + slideStartX never change at runtime here — safe to depend
    // only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drive forward / reverse on play change. Reverse uses half-duration
  // so a quick scroll-up-then-down feels responsive instead of waiting
  // for a full reverse tween to finish.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const masks = root.querySelectorAll<HTMLElement>(".aq-mask");
    const glyphs = root.querySelectorAll<HTMLElement>(".rc-glyph");
    if (!masks.length) return;
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
      gsap.to(masks, {
        clipPath: play ? finalClip : initialClip,
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
          className={`aq-mask inline-block overflow-hidden align-baseline ${charClassName ?? ""}`}
        >
          <span className="rc-glyph inline-block">{ch}</span>
        </span>
      ))}
    </span>
  );
}
