"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Reveals text one line at a time as the user scrolls through the section.
 * Each line transitions from `baseOpacity` (dim grey feel) to 1 (full creme)
 * within its own scroll segment — no continuous scrub, distinct line-by-line
 * thresholds. Lines re-dim on scroll up.
 */
type Props = {
  children: string;
  className?: string;
  baseOpacity?: number;
};

export default function ScrollLineReveal({
  children,
  className,
  baseOpacity = 0.18,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const lines = children.split("\n").filter((l) => l.trim().length > 0);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const lineEls = el.querySelectorAll<HTMLElement>(".slr-line");
      if (!lineEls.length) return;

      // Each line gets its own scrub segment within the section.
      // Section is pinned-feel: we use the parent's height as the trigger area.
      const tween = gsap.to(lineEls, {
        opacity: 1,
        ease: "none",
        stagger: { each: 1, from: "start" },
        scrollTrigger: {
          trigger: el,
          start: "top 75%",
          end: "bottom 65%",
          scrub: 0.4,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        ScrollTrigger.refresh();
      };
    },
    { scope: ref, dependencies: [children] },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {lines.map((line, i) => (
        <span
          key={i}
          className="slr-line block"
          style={{ opacity: baseOpacity }}
        >
          {line}
        </span>
      ))}
    </div>
  );
}
