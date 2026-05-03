"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Site-wide custom cursor: a small filled dot tracking the pointer with a
 * lagging outline ring. Both layers use `mix-blend-difference` so they read
 * over both dark and light backgrounds without per-section theming.
 *
 * Rendered once at the root layout. Self-disables on touch / coarse
 * pointers and is hidden under 640px. The native cursor is intentionally
 * left visible — the dot+ring is an aesthetic overlay, not a replacement.
 *
 * Hover scaling on the ring is delegated from the document, so any anchor,
 * button, or `[data-cursor='hover']` element added later (Menu items,
 * Reserve refuge cards, etc.) gets the effect for free.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Center the visuals on the pointer via GSAP (xPercent/yPercent: -50)
    // instead of Tailwind's -translate-x-1/2 — the latter sets the same
    // `transform` property that GSAP overwrites on every frame.
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    const xToDot = gsap.quickTo(dot, "x", { duration: 0.15, ease: "power3.out" });
    const yToDot = gsap.quickTo(dot, "y", { duration: 0.15, ease: "power3.out" });
    const xToRing = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3.out" });
    const yToRing = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      xToDot(e.clientX);
      yToDot(e.clientY);
      xToRing(e.clientX);
      yToRing(e.clientY);
    };

    // Delegated hover detection — works for elements mounted after this
    // effect runs (Menu items, refuge cards inside the Reserve panel, etc.).
    const INTERACTIVE = "a, button, [role='button'], input, textarea, select, [data-cursor='hover']";
    const onOver = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.(INTERACTIVE)) {
        gsap.to(ring, { scale: 1.8, duration: 0.4, ease: "expo.out" });
      }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.(INTERACTIVE)) {
        gsap.to(ring, { scale: 1, duration: 0.4, ease: "expo.out" });
      }
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.documentElement.classList.add("has-custom-cursor");

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-1.5 w-1.5 rounded-full bg-creme mix-blend-difference will-change-transform max-[640px]:hidden"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-9 w-9 rounded-full border border-creme/60 mix-blend-difference will-change-transform max-[640px]:hidden"
      />
    </>
  );
}
