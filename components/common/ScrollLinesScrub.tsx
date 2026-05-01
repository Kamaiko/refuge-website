"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Continuously scroll-driven line reveal: each line is its own ScrollTrigger,
 * so it fades from `baseOpacity` to 1 as the user scrolls past it. Reverses on
 * scroll-up. Feels like the lines "wake up" one after another as you read them.
 * Distinct from RevealText (one-shot on enter-viewport).
 */
type Props = {
  children: string;
  className?: string;
  baseOpacity?: number;
  /** Start trigger per line — defaults to "top 85%" (line top reaches 85% of viewport). */
  startEach?: string;
  /** End trigger per line — defaults to "top 45%" (line top reaches 45% of viewport). */
  endEach?: string;
};

export default function ScrollLinesScrub({
  children,
  className,
  baseOpacity = 0.15,
  startEach = "top 85%",
  endEach = "top 45%",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const lines = ref.current.querySelectorAll<HTMLElement>(".sls-line");
      lines.forEach((line) => {
        gsap.fromTo(
          line,
          { opacity: baseOpacity },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: line,
              start: startEach,
              end: endEach,
              scrub: 0.4,
            },
          },
        );
      });
    },
    { scope: ref, dependencies: [children] },
  );

  const lines = children.split("\n");

  return (
    <div ref={ref} className={cn(className)}>
      {lines.map((line, i) => (
        <span
          key={i}
          className="sls-line block"
          style={{ opacity: baseOpacity }}
        >
          {line}
        </span>
      ))}
    </div>
  );
}
