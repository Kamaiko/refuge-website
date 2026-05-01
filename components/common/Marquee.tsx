"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  speed?: number; // pixels per second
  className?: string;
  separator?: string;
  /**
   * If true, the marquee reverses direction based on the user's scroll direction.
   * Scrolling down → drifts left. Scrolling up → drifts right.
   */
  directional?: boolean;
};

export default function Marquee({
  text,
  speed = 60,
  className,
  separator = " — ",
  directional = false,
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

      if (!directional || !wrap.current) return;

      let currentDir = 1; // 1 = forward (down-scroll), -1 = reversed (up-scroll)
      const st = ScrollTrigger.create({
        trigger: wrap.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          if (self.direction !== currentDir) {
            currentDir = self.direction;
            gsap.to(tween, {
              timeScale: currentDir,
              duration: 0.6,
              ease: "power2.out",
              overwrite: true,
            });
          }
        },
      });

      return () => {
        st.kill();
        tween.kill();
      };
    },
    { scope: wrap },
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
