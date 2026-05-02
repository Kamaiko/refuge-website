"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Per-character slide-in. Each char sits inside its own fixed mask (box width
 * = char width). The inner glyph starts at xPercent:100 (offscreen-right of
 * its slot) and slides left into place. Mask never moves.
 */
type Props = {
  text: string;
  play: boolean;
  className?: string;
  charClassName?: string;
  duration?: number;
  delay?: number;
};

export default function RevealChars({
  text,
  play,
  className,
  charClassName,
  duration = 0.9,
  delay = 0,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  // Sync GSAP's transform cache with the SSR offscreen state and reveal the
  // wrapper. Without this, the first play tween reads xPercent=0 (default)
  // and snaps the glyphs visible for a frame before tweening.
  useEffect(() => {
    if (!ref.current) return;
    const glyphs = ref.current.querySelectorAll<HTMLElement>(".rc-glyph");
    if (!glyphs.length) return;
    gsap.set(glyphs, { xPercent: 100 });
    gsap.set(ref.current, { visibility: "visible" });
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const glyphs = ref.current.querySelectorAll<HTMLElement>(".rc-glyph");
    if (!glyphs.length) return;
    gsap.to(glyphs, {
      xPercent: play ? 0 : 100,
      duration: play ? duration : duration * 0.5,
      delay: play ? delay : 0,
      ease: play ? "quint.out" : "quint.in",
      overwrite: true,
    });
  }, [play, duration, delay, text]);

  const segments: { type: "word" | "space"; value: string }[] = [];
  const re = /(\S+|\s+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    segments.push({
      type: /\S/.test(m[0]) ? "word" : "space",
      value: m[0],
    });
  }

  return (
    <span
      ref={ref}
      className={className}
      aria-label={text}
      style={{ visibility: "hidden" }}
    >
      {segments.map((seg, si) => {
        if (seg.type === "space") {
          return <span key={`s-${si}`}>{seg.value}</span>;
        }
        return (
          <span
            key={`w-${si}`}
            className="inline-block whitespace-nowrap"
            aria-hidden
          >
            {Array.from(seg.value).map((ch, ci) => (
              <span
                key={`c-${si}-${ci}`}
                className={`inline-block overflow-hidden align-baseline ${charClassName ?? ""}`}
              >
                <span className="rc-glyph inline-block">{ch}</span>
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
}
