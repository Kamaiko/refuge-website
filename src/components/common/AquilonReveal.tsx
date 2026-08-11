"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SITE_CONFIG } from "@/lib/constants";
import { wantsReducedMotion } from "@/lib/motion";
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
  // ⚠️ This component is where the hydration race actually shipped: the
  // wordmark rendered at `xPercent 40` behind a 91% clip — invisible — for
  // reduced-motion readers. The cause was reading the preference from
  // `usePrefersReducedMotion()`, which returns `false` on the hydration render
  // by design. It is now read with `wantsReducedMotion()` inside the effect,
  // where the real value is available; the hook stays in the dependency array
  // only so a mid-session preference change re-runs this.
  //
  // The `visibility` half of the hidden state moved to CSS behind
  // `no-preference` (globals.css, `[data-anim="hidden"]`), so under `reduce`
  // the wordmark is painted by the server and this effect does nothing.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (wantsReducedMotion()) return;
    const glyphs = root.querySelectorAll<HTMLElement>(".rc-glyph");
    gsap.set(glyphs, { xPercent: SLIDE_START_X, clipPath: CLIP_HIDDEN });
    gsap.set(root, { visibility: "visible" });
  }, [prefersReducedMotion]);

  // Drive forward / reverse on play change. Reverse uses half-duration so a
  // quick scroll-up-then-down feels responsive instead of waiting out a
  // full reverse tween.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const glyphs = root.querySelectorAll<HTMLElement>(".rc-glyph");

    if (wantsReducedMotion()) {
      // Still asserts the revealed state rather than merely bailing out — not
      // for the hydration race any more, but for a preference flipped
      // mid-session with glyphs already parked behind their clip.
      gsap.killTweensOf(glyphs);
      gsap.set(glyphs, { xPercent: 0, clipPath: CLIP_REVEALED });
      return;
    }

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
      data-anim="hidden"
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
