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

    // Lenis virtualises scroll, so the browser's native "auto-scroll to a
    // focused element when Tab moves focus offscreen" never fires. Forward
    // focusin events to Lenis explicitly so keyboard navigation works.
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el || typeof el.getBoundingClientRect !== "function") return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Only scroll when the focused element is genuinely off-screen, with
      // a small margin so headers / pinned sections don't fight the scroll.
      const margin = 80;
      if (rect.top >= margin && rect.bottom <= vh - margin) return;
      lenis.scrollTo(el, { offset: -vh / 3 });
    };
    document.addEventListener("focusin", onFocusIn);

    return () => {
      document.removeEventListener("focusin", onFocusIn);
      gsap.ticker.remove(tickerHandler);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Lock background scroll while any panel is open.
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
