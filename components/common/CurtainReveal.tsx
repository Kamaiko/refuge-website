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
 *
 * Both layers are clipped complementarily so only ONE layer is visible at any
 * pixel — eliminates subpixel-antialiasing halos that would otherwise show as
 * a faint white outline around the dim text.
 */
export default function CurtainReveal({
  children,
  className,
  filterColorClass = "text-gris-tan-soft",
  start = "top 90%",
  end = "bottom 25%",
}: {
  children: ReactNode;
  className?: string;
  /** Tailwind text-color class for the dim "filter" overlay. */
  filterColorClass?: string;
  /** ScrollTrigger start position (default 'top 80%'). */
  start?: string;
  /** ScrollTrigger end position (default 'center 55%' — curtain finishes earlier so cream is fully revealed higher in viewport). */
  end?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const creamRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!wrapRef.current || !filterRef.current || !creamRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapRef.current,
          start,
          end,
          // scrub: true = follows scroll exactly (no lag, no bounce). The
          // curtain glides up the entire scroll range of the section.
          scrub: true,
        },
      });

      // Cream is revealed FROM THE TOP: starts hidden (clipped at bottom),
      // unclips downward as filter recedes.
      tl.fromTo(
        creamRef.current,
        { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none" },
        0,
      );
      // Filter recedes from the top: starts visible, clips downward to nothing.
      tl.fromTo(
        filterRef.current,
        { clipPath: "inset(0% 0% 0% 0%)" },
        { clipPath: "inset(100% 0% 0% 0%)", ease: "none" },
        0,
      );
    },
    { scope: wrapRef, dependencies: [start, end] },
  );

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      {/* Bottom layer: creme text — clipped FROM the bottom up, revealed in sync */}
      <div ref={creamRef} className="text-creme">{children}</div>
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
