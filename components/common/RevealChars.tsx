"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Per-character text reveal via clip-path right→left wipe. Triggered by `play`.
 * Words are kept atomic (inline-block, whitespace:nowrap) so a char never
 * breaks mid-word; only spaces between words allow line breaks.
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
      // Reverse stagger from end — rightmost char hides first, like un-typing.
      gsap.to(chars, {
        clipPath: "inset(0 0 0 100%)",
        duration: duration * 0.6,
        stagger: { each: stagger, from: "end" },
        ease: "expo.in",
        overwrite: true,
      });
    }
  }, [play, duration, stagger, delay, text]);

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
