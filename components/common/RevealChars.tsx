"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Reveals text character-by-character via clip-path inset right→left.
 * Each char appears "from the right" — as if a vertical line slides leftward
 * exposing the glyph. Triggered imperatively via the `play` prop.
 *
 * The text is split into words first (each word wrapped in an inline-block,
 * whitespace:nowrap span) so chars within a word never break across lines.
 * Spaces between words remain regular whitespace so the line CAN break there.
 */
type Props = {
  text: string;
  play: boolean;
  className?: string;
  charClassName?: string;
  duration?: number;
  stagger?: number;
  delay?: number;
};

export default function RevealChars({
  text,
  play,
  className,
  charClassName,
  duration = 0.5,
  stagger = 0.025,
  delay = 0,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chars = ref.current.querySelectorAll<HTMLElement>(".rc-char");
    if (!chars.length) return;
    if (play) {
      gsap.to(chars, {
        clipPath: "inset(0 0 0 0%)",
        duration,
        stagger,
        delay,
        ease: "expo.out",
        overwrite: true,
      });
    } else {
      // Reverse: chars fade back to right→left clipped, in reverse stagger
      // (the rightmost char hides first, like un-typing).
      gsap.to(chars, {
        clipPath: "inset(0 0 0 100%)",
        duration: duration * 0.6,
        stagger: { each: stagger, from: "end" },
        ease: "expo.in",
        overwrite: true,
      });
    }
  }, [play, duration, stagger, delay, text]);

  // Split into runs of [word, space, word, space, ...]. Words are wrapped in
  // an inline-block span with whitespace:nowrap so chars within them never
  // break across lines. Spaces stay as regular whitespace so wrapping works.
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
    <span ref={ref} className={className} aria-label={text}>
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
                className={`rc-char inline-block ${charClassName ?? ""}`}
                style={{ clipPath: "inset(0 0 0 100%)" }}
              >
                {ch}
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
}
