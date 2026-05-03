"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useMenu } from "@/components/common/MenuContext";
import { useReservePanel } from "@/components/common/ReservePanelContext";
import ArrowDiagonalIcon from "@/components/common/ArrowDiagonalIcon";
import { SITE_CONFIG } from "@/lib/constants";
import { SCROLL_OUT } from "@/lib/motion";
import { MQ } from "@/lib/breakpoints";
import { CTA } from "@/lib/cta-dimensions";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Persistent floating header. Renders three pinned UI surfaces:
 * - Top-left: brand monogram link back to the home page.
 * - Top-right: `Réserver` CTA — opens the {@link ReservePanel}. Hides on
 *   scroll-down (after a soft delay) and slides back in on scroll-up.
 * - Bottom-center: `Menu` ↔ `Close` CTA — toggles the {@link MenuOverlay}.
 *   The cream pill grows around the inner gris-tan circle on entry; the
 *   label uses an iOS-style vertical wheel to flip between Menu and Close.
 *
 * Menu and Reserve are mutually exclusive: opening Menu always dismisses
 * Reserve. Both contexts must be in the tree
 * ({@link MenuProvider}, {@link ReservePanelProvider}).
 */
export default function Header() {
  const { toggle: menuToggle, isOpen: menuIsOpen } = useMenu();
  const { open: openReservePanel, isOpen: reserveIsOpen } = useReservePanel();
  const reserveRef = useRef<HTMLButtonElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const labelAreaRef = useRef<HTMLSpanElement>(null);
  const wheelRef = useRef<HTMLSpanElement>(null);

  // Three viewport tiers via the shared `useMediaQuery` hook. SSR defaults
  // to desktop (matchMedia returns `false`), then reconciles after mount.
  // Dimensions come from {@link CTA} so MenuOverlay reads the same values
  // for its collapse origin.
  const isTiny = useMediaQuery(MQ.belowXs);
  const isMobile = useMediaQuery(MQ.belowMd);
  const pillH = isTiny ? CTA.pillH.tiny : isMobile ? CTA.pillH.mobile : CTA.pillH.desktop;
  const circleH = isTiny ? CTA.circleH.tiny : isMobile ? CTA.circleH.mobile : CTA.circleH.desktop;

  // Entrance: Reserve fades in at full size; Menu's cream pill grows around
  // the inner circle (height + paddingRight + label width all start at 0
  // so the cream only appears once the pill expands). Re-runs when the
  // breakpoint flips so the pill ends at the correct size on each viewport.
  useGSAP(() => {
    if (reserveRef.current) {
      gsap.fromTo(
        reserveRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.4, ease: "expo.out" },
      );
    }

    if (menuBtnRef.current && labelAreaRef.current) {
      // Initial state: pill at FINAL height + perfect circle (width=height=pillH),
      // cream halo already painted, gris-tan circle centered inside via equal
      // horizontal padding. Only the label area is hidden (width 0 + opacity 0).
      // xPercent:-50 keeps the button centered on its own width — as the pill
      // grows during the stretch tween, it expands symmetrically left+right.
      const padInit = (pillH - circleH) / 2;
      gsap.set(menuBtnRef.current, {
        xPercent: -50,
        height: pillH,
        minWidth: pillH,
        opacity: 0,
        scale: 1,
        paddingLeft: padInit,
        paddingRight: padInit,
        backgroundColor: "var(--color-creme)",
      });
      gsap.set(labelAreaRef.current, { width: 0, opacity: 0 });
      if (wheelRef.current) gsap.set(wheelRef.current, { yPercent: 0 });

      // 1) Snap appearance — quick fade so the assembled pill (cream halo +
      //    gris-tan circle + hamburger) appears as one solid object.
      // 2) Horizontal stretch — paddingLeft → 0 and labelArea width → auto,
      //    so the cream pill extends to the left while the gris-tan circle
      //    naturally slides right (label area opens between the pill's left
      //    edge and the circle).
      // 3) Label fades in AFTER the stretch settles.
      const tl = gsap.timeline();
      tl.to(menuBtnRef.current, {
        opacity: 1,
        duration: 0.25,
        delay: 0.5,
        ease: "power1.out",
      })
        .to(menuBtnRef.current, {
          paddingLeft: 0,
          paddingRight: CTA.pillPaddingRight,
          duration: 0.7,
          ease: "power2.out",
        }, "+=0.1")
        .to(labelAreaRef.current, { width: "auto", duration: 0.7, ease: "power2.out" }, "<")
        // Fade the label in DURING the stretch (start ~60% in) so the two
        // phases blend instead of reading as a discrete 2-step.
        .to(labelAreaRef.current, { opacity: 1, duration: 0.35, ease: "power2.out" }, "-=0.3");
    }
  }, { dependencies: [pillH, circleH] });

  // Menu↔Close iOS wheel. overwrite prevents tween queueing on rapid toggle.
  useGSAP(
    () => {
      if (!wheelRef.current) return;
      gsap.to(wheelRef.current, {
        yPercent: menuIsOpen ? -50 : 0,
        duration: 0.55,
        ease: "expo.inOut",
        overwrite: true,
      });
    },
    { dependencies: [menuIsOpen] },
  );

  // Top-bar scroll-out: brand logo (left) + Reserve CTA (right) hide on
  // scroll-down (after a soft delay) and slide back on scroll-up. They
  // animate together so the top edge reads as a single navbar.
  useEffect(() => {
    const targets = [brandRef.current, reserveRef.current].filter((el) => el !== null);
    if (!targets.length) return;
    const HIDE_AT = 80;
    const SENSITIVITY = 4;
    let lastY = window.scrollY;
    let hidden = false;

    const onScroll = () => {
      const y = Math.max(0, window.scrollY);
      const dy = y - lastY;
      if (Math.abs(dy) < SENSITIVITY) return;
      if (dy > 0 && y > HIDE_AT && !hidden) {
        gsap.to(targets, {
          yPercent: -140,
          opacity: 0,
          duration: SCROLL_OUT.duration,
          delay: SCROLL_OUT.delay,
          ease: "expo.in",
          pointerEvents: "none" as unknown as number,
          overwrite: true,
        });
        hidden = true;
      } else if (dy < 0 && hidden) {
        gsap.to(targets, {
          yPercent: 0,
          opacity: 1,
          duration: SCROLL_OUT.duration,
          delay: SCROLL_OUT.delay,
          ease: "expo.out",
          pointerEvents: "auto" as unknown as number,
          overwrite: true,
        });
        hidden = false;
      }
      lastY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Subtle hover scale on the floating CTAs. Both buttons keep an inline
  // transform written by GSAP (Menu: permanent xPercent:-50 for centering;
  // Reserve: y from entrance + scroll-hide), so a Tailwind `hover:scale`
  // would lose to that inline declaration. Driving the scale through
  // gsap.to lets it merge cleanly with the existing transform stack.
  useEffect(() => {
    const targets = [menuBtnRef.current, reserveRef.current].filter(
      (el): el is HTMLButtonElement => el !== null,
    );
    if (!targets.length) return;
    const cleanups = targets.map((btn) => {
      const enter = () =>
        gsap.to(btn, { scale: 1.04, duration: 0.3, ease: "power2.out", overwrite: "auto" });
      const leave = () =>
        gsap.to(btn, { scale: 1, duration: 0.3, ease: "power2.out", overwrite: "auto" });
      btn.addEventListener("mouseenter", enter);
      btn.addEventListener("mouseleave", leave);
      return () => {
        btn.removeEventListener("mouseenter", enter);
        btn.removeEventListener("mouseleave", leave);
      };
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  // Mutual-exclusion is now handled by stacking order, not state coupling:
  // - Reserve open → Menu CTA z-index drops below the Reserve backdrop and
  //   is set pointer-events:none, so it's visually masked by the blur and
  //   un-clickable.
  // - Menu open → MenuOverlay (z-[290]) covers Reserve (z-[210]) naturally.
  //
  // `reserveMaskActive` holds the masked state for the full backdrop close
  // animation (delay 0.4s + duration 0.4s in ReservePanel). Without this,
  // the Menu pops to z-[300] the instant `reserveIsOpen` flips false, while
  // the backdrop is still mid-fade — producing a one-tick reveal.
  const [reserveMaskActive, setReserveMaskActive] = useState(false);
  useEffect(() => {
    if (reserveIsOpen) {
      setReserveMaskActive(true);
      return;
    }
    const t = setTimeout(() => setReserveMaskActive(false), 850);
    return () => clearTimeout(t);
  }, [reserveIsOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] flex items-start justify-between px-8 pt-10 md:p-10 pointer-events-none">
        <Link
          ref={brandRef}
          href="/"
          aria-label={SITE_CONFIG.name}
          className="group pointer-events-auto relative inline-flex h-16 w-16 md:h-20 md:w-20 items-center justify-center mt-1 rounded-full will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-2 focus-visible:ring-offset-base-noir"
        >
          <Image
            src="/aquilon-logo-transparent.svg"
            alt=""
            width={80}
            height={80}
            priority
            className="h-full w-full transition-opacity group-hover:opacity-80"
          />
        </Link>

        <button
          ref={reserveRef}
          type="button"
          onClick={openReservePanel}
          aria-label="Ouvrir le panneau de réservation"
          style={{ height: pillH, paddingRight: CTA.pillPaddingRight }}
          // Hover scale is driven via gsap.to in the useEffect below — GSAP
          // owns the inline `transform` after entrance + scroll-hide, so a
          // Tailwind `hover:scale` would lose to it (inline wins over CSS).
          className="reserve-cta group opacity-0 pointer-events-auto inline-flex items-center rounded-pill bg-creme/95 font-medium text-base-noir transition-colors hover:bg-creme will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-2 focus-visible:ring-offset-base-noir"
        >
          <span className="pl-5 pr-3 md:pl-7 md:pr-5 text-sm md:text-lg font-medium text-base-noir whitespace-nowrap">
            Réserver
          </span>
          <span
            style={{ height: circleH, width: circleH }}
            className="inline-flex items-center justify-center rounded-full bg-gris-tan shrink-0"
          >
            <ArrowDiagonalIcon size={16} className="text-creme/85 md:hidden" />
            <ArrowDiagonalIcon size={20} className="text-creme/85 hidden md:block" />
          </span>
        </button>
      </header>

      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] pointer-events-none">
        <div className="rounded-l-md bg-base-noir/80 backdrop-blur-sm px-2 py-4 text-creme/80 text-[10px] uppercase tracking-[0.3em] [writing-mode:vertical-rl]">
          Concept · 2026
        </div>
      </div>

      {/* z-[300] sits above ReservePanel (z-210) so Menu wins when both open.
          height + paddingRight live in GSAP, not JSX style — otherwise React
          re-renders would clobber GSAP's tweened values. */}
      <button
        ref={menuBtnRef}
        type="button"
        onClick={menuToggle}
        aria-label={menuIsOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={menuIsOpen}
        // z-[300] normally so the Menu sits above ReservePanel (z-[210])
        // and its backdrop (z-[200]). When Reserve is open, drop to z-[150]
        // so the backdrop covers the Menu (visible through the blur but
        // not clickable). Pointer-events disabled in the same condition.
        className={`menu-cta group opacity-0 fixed bottom-12 md:bottom-12 left-1/2 inline-flex items-center rounded-pill bg-creme will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-2 focus-visible:ring-offset-base-noir ${
          reserveMaskActive ? "z-[150] pointer-events-none" : "z-[300]"
        }`}
      >
        {/* items-start clips the wheel from the top so only "Menu" shows at rest. */}
        <span
          ref={labelAreaRef}
          style={{ width: 0, height: circleH }}
          className="inline-flex items-start text-sm md:text-lg font-medium text-base-noir overflow-hidden will-change-[width]"
        >
          <span className="block pl-8 pr-5 md:pl-12 md:pr-8 whitespace-nowrap">
            <span ref={wheelRef} className="block will-change-transform">
              <span style={{ height: circleH }} className="flex items-center">Menu</span>
              <span style={{ height: circleH }} className="flex items-center">Close</span>
            </span>
          </span>
        </span>

        <span
          style={{ height: circleH, width: circleH }}
          className="inline-flex items-center justify-center rounded-full bg-gris-tan shrink-0"
        >
          <span className="flex flex-col gap-1 md:gap-[5px]">
            <span className="block h-[2px] w-5 md:w-7 bg-creme/85 rounded-full" />
            <span className="block h-[2px] w-5 md:w-7 bg-creme/85 rounded-full" />
            <span className="block h-[2px] w-5 md:w-7 bg-creme/85 rounded-full" />
          </span>
        </span>
      </button>
    </>
  );
}
