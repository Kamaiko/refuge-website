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
  /** ScrollTrigger `start` for the directional-flip deadzone. While the
   *  ribbon's top sits below this line, scroll-direction flips don't
   *  fire — the marquee keeps its current direction. Default `"top 80%"`
   *  (top of ribbon at 80% from viewport top before flips kick in). */
  directionalStart?: string;
  /** If true, the ticker pauses while the cursor is hovering anywhere
   *  inside the wrap's bounding rect, even when the cursor is stationary
   *  during a scroll. Implementation tracks the cursor's last known
   *  position via a global `mousemove` listener and re-runs the
   *  hit-test on every `scroll` event — so a still cursor sliding
   *  "under" the marquee via scroll (or the marquee sliding "out
   *  from under" the cursor) is detected the same as a real
   *  pointerenter/leave.
   *
   *  Direction-flip state is unaffected — a scroll that changes
   *  direction while paused still queues the new direction tween,
   *  which applies when motion resumes. */
  pauseOnHover?: boolean;
  /** Called whenever the pause state changes (cursor enters/leaves
   *  the wrap's hit area). Lets a parent component synchronise other
   *  UI to the same source of truth — typically a color crossfade
   *  on the marquee text. */
  onPauseChange?: (paused: boolean) => void;
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
  directionalStart = "top 80%",
  pauseOnHover = false,
  onPauseChange,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  // Live speed read by the ticker. Synced from the `useMediaQuery` hook
  // via the effect below — writing to a ref (instead of state) keeps the
  // ticker running without a re-render or position reset on viewport flip.
  const speedRef = useRef(speed);
  // Live pause flag for the ticker. Toggled by pointer-enter / leave when
  // `pauseOnHover` is true. Ref, not state, so the ticker reads the latest
  // value every frame without re-rendering the component.
  const pausedRef = useRef(false);
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
        // Hover-pause short-circuit. Don't reset lastY / boost so a quick
        // pause-resume doesn't produce a jolt; the boost state stays valid
        // and the ribbon picks up the exact same x as when it paused.
        if (pausedRef.current) return;
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

      // Pause-on-hover wiring. Naive pointerenter/leave miss two cases :
      //  1) Cursor parked over the wrap before any movement — no enter
      //     event has fired yet.
      //  2) Page scrolls while the cursor stays still — the wrap slides
      //     in or out from under a stationary cursor, but the browser
      //     fires no enter/leave events because the cursor itself
      //     didn't move.
      //
      // Fix : track the cursor's last known viewport position via a
      // global `mousemove` listener, then re-hit-test against the
      // wrap's current bounding rect on every scroll event. The state
      // change is reported via `onPauseChange` so a parent component
      // (typically the Cta wrapper driving a color crossfade) stays in
      // sync with the marquee's internal pause flag.
      let removeHover: (() => void) | null = null;
      if (pauseOnHover && wrap.current) {
        const el = wrap.current;
        // Cursor coords seeded out-of-bounds so the first scroll before
        // any mouse movement reads as "not hovering" (no false pause).
        let cursorX = -1;
        let cursorY = -1;

        const setPaused = (next: boolean) => {
          if (next === pausedRef.current) return;
          pausedRef.current = next;
          onPauseChange?.(next);
        };

        const hitTest = () => {
          if (cursorX < 0) {
            setPaused(false);
            return;
          }
          const rect = el.getBoundingClientRect();
          const inside =
            cursorX >= rect.left &&
            cursorX <= rect.right &&
            cursorY >= rect.top &&
            cursorY <= rect.bottom;
          setPaused(inside);
        };

        const onMouseMove = (e: MouseEvent) => {
          cursorX = e.clientX;
          cursorY = e.clientY;
          hitTest();
        };
        const onScroll = () => hitTest();

        window.addEventListener("mousemove", onMouseMove, { passive: true });
        window.addEventListener("scroll", onScroll, { passive: true });
        removeHover = () => {
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("scroll", onScroll);
        };
      }

      if (!directional || !wrap.current) {
        return () => {
          gsap.ticker.remove(tickerFn);
          removeHover?.();
        };
      }

      let currentDir = 1;
      const st = ScrollTrigger.create({
        trigger: wrap.current,
        // Deadzone configured by `directionalStart` prop — while the
        // ribbon's top sits below that line, the directional onUpdate
        // doesn't fire and the ribbon keeps its current direction. Once
        // the top crosses it, scroll-direction flips resume. Reversible.
        start: directionalStart,
        end: "bottom top",
        onUpdate: (self) => {
          if (self.direction !== currentDir) {
            currentDir = self.direction;
            // 0.2s is short enough to feel near-immediate in response
            // to a scroll-direction flick while still smoothing the
            // +/- velocity crossing — without an ease, the ribbon
            // would snap from +N to -N in a single frame and look
            // broken. Previously 0.35s, which felt sluggish.
            gsap.to(dirState, {
              value: currentDir,
              duration: 0.2,
              ease: "power2.out",
              overwrite: true,
            });
          }
        },
      });

      return () => {
        st.kill();
        gsap.ticker.remove(tickerFn);
        removeHover?.();
      };
    },
    { scope: wrap, dependencies: [directional, scrollBoost, directionalStart, pauseOnHover] },
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
