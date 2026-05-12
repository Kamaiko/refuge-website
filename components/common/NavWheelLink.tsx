"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

/**
 * Nav link with an iOS-style vertical "wheel" flip on hover. At rest the
 * cream label sits on top of a hidden tan-foncé duplicate of the same word;
 * pointer-enter slides the wheel up so the tan version takes the cream's
 * place, pointer-leave reverses. Mechanism is identical to the floating
 * Menu↔Close pill in {@link Header} (`yPercent: 0 → -50`, `0.55s`
 * `expo.inOut`), but the bottom layer carries the same text in a different
 * color rather than a different word.
 *
 * Reduced-motion: GSAP detects `prefers-reduced-motion: reduce` and the
 * wheel snaps in zero duration; the result is a plain color swap.
 */
export default function NavWheelLink({
  label,
  href,
  className = "",
}: {
  label: string;
  href: string;
  className?: string;
}) {
  const wheelRef = useRef<HTMLSpanElement>(null);

  // `pauseOnHover`-style overwrite: a fast hover-flick must not stack
  // forward + backward tweens. `overwrite: true` kills any in-flight tween
  // on the same target and starts a fresh one from the current value.
  const animate = (yPercent: number) => {
    if (!wheelRef.current) return;
    gsap.to(wheelRef.current, {
      yPercent,
      duration: 0.55,
      ease: "expo.inOut",
      overwrite: true,
    });
  };

  // Set the wheel's initial yPercent on mount so the cream label is the
  // one visible at rest. GSAP otherwise has no inline transform until the
  // first tween fires, which would let the bottom layer peek for one frame
  // on touch devices that don't dispatch pointer events.
  useGSAP(() => {
    if (wheelRef.current) gsap.set(wheelRef.current, { yPercent: 0 });
  }, []);

  return (
    <a
      href={href}
      aria-label={label}
      onPointerEnter={() => animate(-50)}
      onPointerLeave={() => animate(0)}
      onFocus={() => animate(-50)}
      onBlur={() => animate(0)}
      // `h-[1.15em]` + `leading-[1.15]` + `overflow-hidden` constrain the
      // element to a single line of text so the second (tan) layer is
      // clipped at rest. Each inner span auto-sizes to one line at the
      // same line-height → wheel total = 2.3em, yPercent:-50 lands the
      // tan layer exactly where the cream one was.
      className={`group inline-block overflow-hidden align-bottom leading-[1.15] h-[1.15em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creme/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-noir rounded-sm ${className}`}
    >
      {/* aria-hidden on both layers — the <a aria-label> announces the link
          name once, so screen readers don't read the duplicated word. */}
      <span ref={wheelRef} aria-hidden className="block will-change-transform">
        <span className="block text-creme">{label}</span>
        <span className="block text-creme-terre/70">{label}</span>
      </span>
    </a>
  );
}
