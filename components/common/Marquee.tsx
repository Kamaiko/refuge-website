"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  /** Pixels per second (constant — no scroll-driven acceleration). */
  speed?: number;
  className?: string;
  separator?: string;
  /** If true, scroll direction flips the marquee direction. */
  directional?: boolean;
};

/** Infinite horizontal marquee. Duplicates `text` enough times to fill the
 *  container twice, then translates the track by half its width on a
 *  forever-looping linear tween. Set `directional` to flip the marquee's
 *  travel direction whenever the page scroll direction changes. */
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

      // Manual ticker, not a `gsap.to(... repeat: -1)` tween. A repeating
      // tween's totalTime bottoms out at 0 when reversed long enough —
      // past that point GSAP stops updating and the marquee freezes at
      // the start of a repeat. Here `x` is project-local state, wrapped
      // into [-half, 0) every frame, so it can run forever in either
      // direction with zero accumulated drift. Same per-frame cost as
      // a tween (one math op + one transform write) — actually a touch
      // cheaper, no tween bookkeeping.
      let x = 0;
      const dirState = { value: 1 };

      const tickerFn = (_time: number, deltaTime: number) => {
        x -= dirState.value * speed * (deltaTime / 1000);
        if (x <= -half) x += half;
        else if (x > 0) x -= half;
        gsap.set(t, { x });
      };

      gsap.ticker.add(tickerFn);

      if (!directional || !wrap.current) {
        return () => gsap.ticker.remove(tickerFn);
      }

      let currentDir = 1;
      const st = ScrollTrigger.create({
        trigger: wrap.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          if (self.direction !== currentDir) {
            currentDir = self.direction;
            gsap.to(dirState, {
              value: currentDir,
              duration: 0.6,
              ease: "power2.out",
              overwrite: true,
            });
          }
        },
      });

      return () => {
        st.kill();
        gsap.ticker.remove(tickerFn);
      };
    },
    { scope: wrap, dependencies: [directional] },
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
