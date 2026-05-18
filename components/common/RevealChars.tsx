"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Configuration for {@link RevealChars}.
 *  - `text`: the string to reveal — used both for rendering and as
 *    `aria-label` on the wrapper (per-glyph spans are `aria-hidden`).
 *  - `play`: imperative trigger. Flip from false → true to slide the
 *    glyphs in; true → false plays a faster reverse-out.
 *  - `charClassName`: applied to each per-glyph mask span if you need
 *    extra alignment / leading control.
 *  - `stagger`: per-character delay in seconds. Default 0 (all glyphs
 *    move together). Useful at small font sizes where the per-glyph
 *    sweep would otherwise pass too fast to read. */
type Props = {
  text: string;
  play: boolean;
  className?: string;
  charClassName?: string;
  duration?: number;
  delay?: number;
  stagger?: number;
  /** HTML tag the wrapper renders as. Defaults to `<span>` because most
   *  call sites (subtitles, surnoms) aren't headings — pass `"h2"` or
   *  `"h3"` for the spots that ARE the section's semantic title. */
  as?: "span" | "h1" | "h2" | "h3" | "h4";
};

/**
 * Per-character horizontal slide-in. Each char sits inside its own fixed
 * mask (box width = char width). The inner glyph starts at `xPercent:100`
 * (offscreen-right of its slot) and slides left into place. The mask
 * never moves, so word spacing and line wrapping stay pixel-stable.
 *
 * Imperative — driven by the `play` prop, not a ScrollTrigger. Use when
 * the reveal needs to fire on something other than scroll position
 * (e.g. the active pinned card in the Hebergements section).
 */
export default function RevealChars({
  text,
  play,
  className,
  charClassName,
  duration = 0.9,
  delay = 0,
  stagger = 0,
  as: Tag = "span",
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  // Sync GSAP's transform cache with the SSR offscreen state and reveal the
  // wrapper. Without this, the first play tween reads xPercent=0 (default)
  // and snaps the glyphs visible for a frame before tweening.
  // xPercent: 110 (not 100) buffers ~10% past the mask edge — at xPercent:100
  // the glyph's left edge sits exactly on the mask's right edge, where
  // sub-pixel antialiasing can leak 1px back into the mask and read as a
  // faint vertical bar before the reveal plays.
  useEffect(() => {
    if (!ref.current) return;
    const glyphs = ref.current.querySelectorAll<HTMLElement>(".rc-glyph");
    if (!glyphs.length) return;
    gsap.set(glyphs, { xPercent: 110 });
    gsap.set(ref.current, { visibility: "visible" });
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const glyphs = ref.current.querySelectorAll<HTMLElement>(".rc-glyph");
    if (!glyphs.length) return;
    gsap.to(glyphs, {
      xPercent: play ? 0 : 110,
      duration: play ? duration : duration * 0.5,
      delay: play ? delay : 0,
      stagger: play ? stagger : stagger * 0.5,
      ease: play ? "quint.out" : "quint.in",
      overwrite: true,
    });
  }, [play, duration, delay, stagger, text]);

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
    <Tag
      ref={ref as React.RefObject<HTMLSpanElement & HTMLHeadingElement>}
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
                className={cn("inline-block overflow-hidden align-baseline", charClassName)}
              >
                <span className="rc-glyph inline-block">{ch}</span>
              </span>
            ))}
          </span>
        );
      })}
    </Tag>
  );
}
