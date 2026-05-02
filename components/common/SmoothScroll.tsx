"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMenu } from "./MenuContext";
import { useReservePanel } from "./ReservePanelContext";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const { isOpen: menuIsOpen } = useMenu();
  const { isOpen: reserveIsOpen } = useReservePanel();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.1,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tickerHandler = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerHandler);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerHandler);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Pause Lenis (and lock native body scroll as a belt-and-braces fallback)
  // whenever a full-screen panel is open. Prevents background scroll under
  // the Reserve panel and Menu overlay.
  useEffect(() => {
    const anyOpen = menuIsOpen || reserveIsOpen;
    const lenis = lenisRef.current;
    if (anyOpen) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuIsOpen, reserveIsOpen]);

  return <>{children}</>;
}
