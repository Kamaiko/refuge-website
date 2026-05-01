"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Sharp-edged "curtain" reveal: a darker filter sits on top of the cream text
 * and recedes upward as the user scrolls through the section. The cut between
 * the filtered (top) and revealed (bottom) portion is a hard line — no gradient.
 * Scroll-driven scrub.
 */
export default function CurtainReveal({
  children,
  className,
  filterColorClass = "text-gris-tan-soft",
  start = "top 80%",
  end = "bottom 70%",
}: {
  children: ReactNode;
  className?: string;
  /** Tailwind text-color class for the dim "filter" overlay. */
  filterColorClass?: string;
  /** ScrollTrigger start position (default 'top 80%'). */
  start?: string;
  /** ScrollTrigger end position (default 'bottom 70%' — curtain finishes earlier). */
  end?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!wrapRef.current || !filterRef.current) return;
      gsap.fromTo(
        filterRef.current,
        { clipPath: "inset(0% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 100% 0%)",
          ease: "none",
          scrollTrigger: {
            trigger: wrapRef.current,
            start,
            end,
            scrub: 0.4,
          },
        },
      );
    },
    { scope: wrapRef, dependencies: [start, end] },
  );

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      {/* Bottom layer: creme text (revealed final state) */}
      <div className="text-creme">{children}</div>
      {/* Top layer: dark filter — same text, clipped from bottom upward */}
      <div
        ref={filterRef}
        aria-hidden
        className={cn("absolute inset-0 pointer-events-none", filterColorClass)}
      >
        {children}
      </div>
    </div>
  );
}
