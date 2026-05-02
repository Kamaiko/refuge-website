"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Scroll-scrubbed sharp-edged curtain. A darker copy of the text sits on top
 * of the cream copy; both are clipped complementarily as you scroll, so only
 * one layer paints at any pixel — avoids the subpixel-antialiasing halo a
 * naive overlay would produce.
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
  filterColorClass?: string;
  start?: string;
  end?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const creamRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!wrapRef.current || !filterRef.current || !creamRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: wrapRef.current, start, end, scrub: true },
      });

      tl.fromTo(
        creamRef.current,
        { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none" },
        0,
      );
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
      <div ref={creamRef} className="text-creme">{children}</div>
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
