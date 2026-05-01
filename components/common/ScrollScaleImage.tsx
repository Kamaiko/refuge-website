"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  scaleFrom?: number;
  scaleTo?: number;
  start?: string;
  end?: string;
  scrub?: number | boolean;
};

/**
 * Wraps an image (or any visual block) with a scrub-driven scale animation.
 * Pattern: image starts overscaled (e.g. 1.4) and "unzooms" to its natural size
 * as the user scrolls into the section. Inspired by hospitality scroll-driven sites.
 */
export default function ScrollScaleImage({
  children,
  className,
  scaleFrom = 1.4,
  scaleTo = 1,
  start = "top bottom",
  end = "center center",
  scrub = 1,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!wrap.current || !inner.current) return;
      gsap.fromTo(
        inner.current,
        { scale: scaleFrom },
        {
          scale: scaleTo,
          ease: "none",
          scrollTrigger: {
            trigger: wrap.current,
            start,
            end,
            scrub,
          },
        },
      );
    },
    { scope: wrap },
  );

  return (
    <div ref={wrap} className={cn("relative overflow-hidden", className)}>
      <div ref={inner} className="relative h-full w-full will-change-transform">
        {children}
      </div>
    </div>
  );
}
