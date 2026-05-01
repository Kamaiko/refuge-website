"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Sharp-edged "curtain" reveal: a grey filter sits on top of cream text and
 * recedes upward as the user scrolls through the section. The cut between the
 * grey portion (top) and the revealed cream portion (bottom) is a hard line —
 * no gradient. Scroll-driven scrub, so the filter follows the scroll position.
 */
export default function CurtainReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
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
            start: "top 80%",
            end: "bottom 55%",
            scrub: 0.4,
          },
        },
      );
    },
    { scope: wrapRef },
  );

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      {/* Bottom layer: creme text (the reveal target) */}
      <div className="text-creme">{children}</div>
      {/* Top layer: grey filter — same text, clipped from bottom upward */}
      <div
        ref={filterRef}
        aria-hidden
        className="absolute inset-0 text-gris-secondaire pointer-events-none"
      >
        {children}
      </div>
    </div>
  );
}
