"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SECTION_LOCK_EVENT, type SectionLockDetail } from "@/lib/section-lock";
import { useMenu } from "./MenuContext";
import { useReservePanel } from "./ReservePanelContext";

/**
 * Owns the global Lenis smooth-scroll lifecycle and synchronises it with
 * GSAP's ScrollTrigger ticker.
 *
 * Responsibilities:
 * - Disabled entirely when `prefers-reduced-motion: reduce`.
 * - Forwards `focusin` events to Lenis so keyboard navigation scrolls the
 *   focused element into view (Lenis virtualises scroll, so the browser's
 *   native auto-scroll doesn't fire). Skips elements inside a fixed/sticky
 *   ancestor — they're already pinned to the viewport.
 * - Locks background scroll while the Menu or Reserve panel is open
 *   (single owner — duplicate locks elsewhere caused restore races).
 *
 * Must wrap any consumer of `useMenu` / `useReservePanel` because it reads
 * those contexts to drive the scroll lock.
 */
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
      // Skip elements pinned to the viewport (fixed/sticky CTAs like the
      // Menu and Reserve buttons). They're always visible — scrolling the
      // page can't bring them more into view and just causes jumpy focus.
      for (
        let node: HTMLElement | null = el;
        node && node !== document.body;
        node = node.parentElement
      ) {
        const pos = getComputedStyle(node).position;
        if (pos === "fixed" || pos === "sticky") return;
      }
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Only scroll when the focused element is genuinely off-screen, with
      // a small margin so headers / pinned sections don't fight the scroll.
      const margin = 80;
      if (rect.top >= margin && rect.bottom <= vh - margin) return;
      lenis.scrollTo(el, { offset: -vh / 3 });
    };
    document.addEventListener("focusin", onFocusIn);

    // Section-level Lenis lock: any section that needs to fully control
    // scroll input (e.g. Vivre's wheel-hijack carousel) dispatches the
    // SECTION_LOCK_EVENT. We stop/start Lenis here so the section's wheel
    // handler can fully take over — otherwise Lenis's smooth-scroll tween
    // would carry the user past the section faster than the wheel
    // listener can intercept. See `lib/section-lock.ts` for the contract.
    const onSectionLock = (e: Event) => {
      const detail = (e as CustomEvent<SectionLockDetail>).detail;
      if (detail?.lock) lenis.stop();
      else lenis.start();
    };
    window.addEventListener(SECTION_LOCK_EVENT, onSectionLock);

    return () => {
      document.removeEventListener("focusin", onFocusIn);
      window.removeEventListener(SECTION_LOCK_EVENT, onSectionLock);
      gsap.ticker.remove(tickerHandler);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Lock background scroll AND make page content un-focusable while any
  // panel is open. The `inert` attribute on <main> removes its subtree
  // from sequential focus navigation and pointer events — combined with
  // the panel's overlay rendering siblings to <main>, this creates a
  // proper focus trap without a JS focus-cycling library.
  //
  // Body lock uses the position:fixed pattern (not just overflow:hidden):
  // it bulletproofs against iOS Safari rubber-band, prevents scroll
  // chaining from inside the panel back to the page, and cooperates with
  // Lenis's wheel handling. Scroll position is captured before the lock
  // and restored after, so the user lands back exactly where they were.
  const lockedScrollYRef = useRef(0);
  useEffect(() => {
    const anyOpen = menuIsOpen || reserveIsOpen;
    const lenis = lenisRef.current;
    const main = document.querySelector("main");
    if (anyOpen) {
      lockedScrollYRef.current = window.scrollY;
      lenis?.stop();
      const body = document.body;
      body.style.position = "fixed";
      body.style.top = `-${lockedScrollYRef.current}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.overflow = "hidden";
      main?.setAttribute("inert", "");
    } else {
      const body = document.body;
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.overflow = "";
      window.scrollTo(0, lockedScrollYRef.current);
      lenis?.start();
      main?.removeAttribute("inert");
    }
    // Safety net: if SmoothScroll unmounts while a lock is active, restore
    // body styles so the page isn't left frozen.
    return () => {
      const body = document.body;
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.overflow = "";
      main?.removeAttribute("inert");
    };
  }, [menuIsOpen, reserveIsOpen]);

  return <>{children}</>;
}
