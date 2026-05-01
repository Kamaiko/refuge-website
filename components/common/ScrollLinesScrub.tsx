"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Continuously scroll-driven line reveal: each line's opacity is tied to scroll
 * position via scrub. Reveals on scroll-down, un-reveals on scroll-up.
 * Distinct from RevealText (one-shot on enter-viewport).
 */
type Props = {
  children: string;
  className?: string;
  baseOpacity?: number;
  start?: string;
  end?: string;
  staggerEach?: number;
};

export default function ScrollLinesScrub({
  children,
  className,
  baseOpacity = 0.15,
  start = "top 80%",
  end = "bottom 60%",
  staggerEach = 0.4,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const lines = ref.current.querySelectorAll<HTMLElement>(".sls-line");
      if (!lines.length) return;
      gsap.fromTo(
        lines,
        { opacity: baseOpacity },
        {
          opacity: 1,
          ease: "none",
          stagger: staggerEach,
          scrollTrigger: {
            trigger: ref.current,
            start,
            end,
            scrub: 0.5,
          },
        },
      );
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
