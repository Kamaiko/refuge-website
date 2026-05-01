"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  /** Pixels per second. Constant — no scroll-driven acceleration. */
  speed?: number;
  className?: string;
  separator?: string;
  /**
   * If set (0-1), the marquee flips direction ONCE when the section reaches
   * that viewport threshold (e.g. 0.2 = section is ≥20% in view). Reverts to
   * its original direction when scrolled back above the threshold.
   * Use for a deliberate "section recognition" beat, not continuous coupling.
   */
  flipAt?: number;
};

export default function Marquee({
  text,
  speed = 60,
  className,
  separator = " — ",
  flipAt,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const t = track.current;
      if (!t) return;

      const half = t.scrollWidth / 2;
      const duration = half / speed;

      const tween = gsap.to(t, {
        x: -half,
        duration,
        ease: "none",
        repeat: -1,
      });

      if (typeof flipAt !== "number" || !wrap.current) return;

      // start position string: "top XX%" where XX = (1 - threshold) * 100
      // e.g. flipAt 0.2 → "top 80%" (section top reaches 80% down viewport,
      // meaning 20% of section is now visible).
      const startPct = Math.round((1 - flipAt) * 100);
      const st = ScrollTrigger.create({
        trigger: wrap.current,
        start: `top ${startPct}%`,
        end: "bottom top",
        onEnter: () => {
          gsap.to(tween, { timeScale: -1, duration: 0.6, ease: "power2.out", overwrite: true });
        },
        onLeaveBack: () => {
          gsap.to(tween, { timeScale: 1, duration: 0.6, ease: "power2.out", overwrite: true });
        },
      });

      return () => {
        st.kill();
        tween.kill();
      };
    },
    { scope: wrap, dependencies: [flipAt] },
  );

  return (
    <div ref={wrap} className={cn("overflow-hidden", className)}>
      <div ref={track} className="flex w-max whitespace-nowrap will-change-transform">
        {Array.from({ length: 2 }).map((_, i) => (
          <span key={i} className="inline-flex shrink-0 items-center">
            {Array.from({ length: 6 }).map((_, j) => (
              <span key={j} className="px-6">
                {text}
                <span className="text-creme-dim/30 px-4">{separator}</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
