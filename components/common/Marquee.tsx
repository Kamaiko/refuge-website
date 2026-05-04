"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { MQ } from "@/lib/breakpoints";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type Props = {
  text: string;
  /** Pixels per second on viewports ≥ 768px. Constant baseline — see
   *  `scrollBoost` for scroll-driven acceleration on top of this. */
  speed?: number;
  /** Pixels per second on viewports < 768px. Defaults to `speed` when omitted.
   *  Useful when the marquee uses a viewport-relative font size (`text-[24vw]`)
   *  and looks proportionally faster on small screens. */
  mobileSpeed?: number;
  className?: string;
  separator?: string;
  /** If true, scroll direction flips the marquee direction. */
  directional?: boolean;
  /** If true, scroll velocity adds a subtle boost on top of `speed` —
   *  base speed when idle, asymptotically peaks near 3× during fast
   *  scrolling. Boost decays smoothly back to 1 when the scroll stops. */
  scrollBoost?: boolean;
};

/** Infinite horizontal marquee. Duplicates `text` enough times to fill the
 *  container twice, then translates the track by half its width on a
 *  forever-looping linear tween. Set `directional` to flip the marquee's
 *  travel direction whenever the page scroll direction changes. */
export default function Marquee({
  text,
  speed = 60,
  mobileSpeed,
  className,
  separator = " — ",
  directional = false,
  scrollBoost = false,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  // Live speed read by the ticker. Synced from the `useMediaQuery` hook
  // via the effect below — writing to a ref (instead of state) keeps the
  // ticker running without a re-render or position reset on viewport flip.
  const speedRef = useRef(speed);
  const isMobile = useMediaQuery(MQ.belowMd);

  useEffect(() => {
    speedRef.current = mobileSpeed !== undefined && isMobile ? mobileSpeed : speed;
  }, [speed, mobileSpeed, isMobile]);

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

      // Scroll-boost state. `boost` is a multiplier on the base speed,
      // anchored at 1 (idle = base speed) and easing toward a target
      // derived from current scroll velocity. Saturating curve caps it
      // near 3× even during very fast scrolls (no whoosh).
      let boost = 1;
      let lastY = window.scrollY;
      const BOOST_MAX = 2.2; // total cap = 1 + 2.2 = 3.2×
      const VEL_HALF = 500; // px/s where extra-boost reaches half-cap
      const LERP = 0.22; // per-frame ease toward target — snappier decay

      // quickSetter bypasses GSAP's property parser — significantly faster
      // than `gsap.set(t, { x })` for a per-frame transform write.
      const setX = gsap.quickSetter(t, "x", "px") as (value: number) => void;

      const tickerFn = (_time: number, deltaTime: number) => {
        const dt = deltaTime / 1000;
        if (scrollBoost) {
          const y = window.scrollY;
          const scrollVel = dt > 0 ? Math.abs(y - lastY) / dt : 0;
          lastY = y;
          // x / (x + half) maps [0, ∞) → [0, 1) — saturating, smooth, no
          // discontinuity. Multiplied by BOOST_MAX gives the additive boost.
          const target = 1 + (scrollVel / (scrollVel + VEL_HALF)) * BOOST_MAX;
          boost += (target - boost) * LERP;
        }
        x -= dirState.value * speedRef.current * boost * dt;
        if (x <= -half) x += half;
        else if (x > 0) x -= half;
        setX(x);
      };

      gsap.ticker.add(tickerFn);

      if (!directional || !wrap.current) {
        return () => gsap.ticker.remove(tickerFn);
      }

      let currentDir = 1;
      const st = ScrollTrigger.create({
        trigger: wrap.current,
        // Deadzone: while the ribbon's top sits in the bottom 30% of the
        // viewport, the directional onUpdate doesn't fire — the ribbon
        // keeps its current direction even if the user wiggles the
        // scroll. Once the top crosses 70%, scroll-direction flips
        // resume. Reversible: scrolling back into the deadzone disables
        // flipping again (ScrollTrigger marks the trigger inactive
        // outside [start, end] and stops invoking onUpdate).
        start: "top 70%",
        end: "bottom top",
        onUpdate: (self) => {
          if (self.direction !== currentDir) {
            currentDir = self.direction;
            // 0.35s is short enough to feel responsive to a scroll flick
            // but still smooths the +/- velocity crossing — without an
            // ease, the ribbon would snap from +N to -N in a single frame
            // and look broken.
            gsap.to(dirState, {
              value: currentDir,
              duration: 0.35,
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
    { scope: wrap, dependencies: [directional, scrollBoost] },
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
