"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useMenu } from "@/components/common/MenuContext";
import { useReservePanel } from "@/components/common/ReservePanelContext";
import { SITE_CONFIG } from "@/lib/constants";
import { SCROLL_OUT } from "@/lib/motion";

const PILL_H = 84; // px — outer cream pill height
const CIRCLE_H = 74; // px — inner gris-tan circle height (tighter cream halo)
const PILL_PR = 4; // px — cream margin past the inner circle on the right

export default function Header() {
  const { toggle: menuToggle, isOpen: menuIsOpen } = useMenu();
  const { open: openReservePanel, close: closeReservePanel, isOpen: reserveIsOpen } = useReservePanel();
  const reserveRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const labelAreaRef = useRef<HTMLSpanElement>(null);
  const wheelRef = useRef<HTMLSpanElement>(null);

  // Initial entrance.
  // Reserve: simple fade-in at full size (label always visible, no grow).
  // Menu: cream pill grows around the inner circle as label widens — keeps
  // the playful "unrolling" entrance only on the Menu CTA.
  useGSAP(() => {
    if (reserveRef.current) {
      gsap.fromTo(
        reserveRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.4, ease: "expo.out" },
      );
    }

    if (menuBtnRef.current && labelAreaRef.current) {
      // Initial state: button is exactly the inner circle's footprint —
      // no paddingRight cream sliver, no extra height. The cream pill
      // appears AROUND the circle as the button grows + label widens.
      gsap.set(menuBtnRef.current, { height: CIRCLE_H, opacity: 0, scale: 0.6, paddingRight: 0 });
      gsap.set(labelAreaRef.current, { width: 0 });
      if (wheelRef.current) gsap.set(wheelRef.current, { yPercent: 0 });

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl
        .to(menuBtnRef.current, { opacity: 1, scale: 1, duration: 0.6, delay: 0.5 })
        .to(menuBtnRef.current, { height: PILL_H, paddingRight: PILL_PR, duration: 0.55 }, "+=0.05")
        .to(labelAreaRef.current, { width: "auto", duration: 0.85 }, "<");
    }
  });

  // iOS-wheel: only one word visible. yPercent 0 → -50 to switch.
  useGSAP(
    () => {
      if (!wheelRef.current) return;
      gsap.to(wheelRef.current, {
        yPercent: menuIsOpen ? -50 : 0,
        duration: 0.55,
        ease: "expo.inOut",
      });
    },
    { dependencies: [menuIsOpen] },
  );

  // Reserve scroll-out — simple direction-based logic. Scrolling DOWN past a
  // small threshold hides it after a soft delay; scrolling UP shows it again.
  // Not anchored to any section, just listens to window scroll direction.
  useEffect(() => {
    const btn = reserveRef.current;
    if (!btn) return;
    const HIDE_AT = 80; // px from top before hide kicks in
    const SENSITIVITY = 4; // min |dy| to register a direction change
    let lastY = window.scrollY;
    let hidden = false;

    const onScroll = () => {
      const y = Math.max(0, window.scrollY);
      const dy = y - lastY;
      if (Math.abs(dy) < SENSITIVITY) return;
      if (dy > 0 && y > HIDE_AT && !hidden) {
        gsap.to(btn, {
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
        gsap.to(btn, {
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

  // Coordination — opening Menu always closes Reserve so Menu is visible
  // (no z-index conflict). Closing Menu also closes Reserve so the user
  // returns to a clean baseline after dismissing Menu.
  const handleMenuToggle = () => {
    if (!menuIsOpen) {
      // about to OPEN menu
      if (reserveIsOpen) closeReservePanel();
    }
    menuToggle();
  };
  useEffect(() => {
    if (!menuIsOpen && reserveIsOpen) {
      // closing menu while reserve was up: close reserve too
      closeReservePanel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuIsOpen]);

  return (
    <>
      {/* Brand mark — top-left of header */}
      <header className="fixed top-0 left-0 right-0 z-[100] flex items-start justify-between p-7 md:p-10 pointer-events-none">
        <Link
          href="/"
          aria-label={SITE_CONFIG.name}
          className="group pointer-events-auto relative inline-flex h-9 w-9 items-center justify-center mt-1"
        >
          <span className="absolute inset-0 rounded-full border border-creme/30 transition-colors group-hover:border-creme/80" />
          <span className="relative text-creme font-semibold tracking-tight text-sm">
            {SITE_CONFIG.brandMark}
          </span>
        </Link>

        {/* Reserve CTA — top-right. Static layout (no entry grow); just a
            simple opacity/y fade-in handled by the useGSAP above. The Menu
            CTA keeps the unrolling entry — Reserve doesn't. */}
        <button
          ref={reserveRef}
          type="button"
          onClick={openReservePanel}
          aria-label="Ouvrir le panneau de réservation"
          style={{ height: PILL_H, paddingRight: PILL_PR }}
          className="reserve-cta opacity-0 pointer-events-auto inline-flex items-center rounded-pill bg-creme/95 text-lg font-medium text-base-noir transition-colors hover:bg-creme will-change-transform"
        >
          <span className="pl-7 pr-5 text-lg font-medium text-base-noir whitespace-nowrap">
            Réserver
          </span>
          <span
            style={{ height: CIRCLE_H, width: CIRCLE_H }}
            className="inline-flex items-center justify-center rounded-full bg-gris-tan shrink-0"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 14 14"
              fill="none"
              className="text-creme/85"
              aria-hidden
            >
              <path
                d="M3 11L11 3M11 3H4M11 3V10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </header>

      {/* Side badge */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] pointer-events-none">
        <div className="rounded-l-md bg-base-noir/80 backdrop-blur-sm px-2 py-4 text-creme/80 text-[10px] uppercase tracking-[0.3em] [writing-mode:vertical-rl]">
          Concept · 2026
        </div>
      </div>

      {/* Menu CTA — fixed bottom-CENTER. Z-index higher than Reserve panel
          (210) so opening Menu visually takes the foreground. The handleMenuToggle
          also forcibly closes Reserve to avoid layered confusion. */}
      <button
        ref={menuBtnRef}
        type="button"
        onClick={handleMenuToggle}
        aria-label={menuIsOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={menuIsOpen}
        // No paddingRight in JSX style — GSAP manages it (0 → PILL_PR
        // synced with the cream pill grow) so React can't reapply on
        // re-render and create the asymmetric cream sliver before entry.
        className="menu-cta h-[68px] opacity-0 fixed bottom-12 left-1/2 z-[300] -translate-x-1/2 inline-flex items-center rounded-pill bg-creme will-change-transform"
      >
        {/* items-start so the wheel children stack at the top of the clipped
            area — only "Menu" is visible at rest. */}
        <span
          ref={labelAreaRef}
          style={{ width: 0, height: CIRCLE_H }}
          className="inline-flex items-start text-lg font-medium text-base-noir overflow-hidden will-change-[width]"
        >
          <span className="block pl-7 pr-5 whitespace-nowrap">
            <span ref={wheelRef} className="block will-change-transform">
              <span style={{ height: CIRCLE_H }} className="flex items-center">Menu</span>
              <span style={{ height: CIRCLE_H }} className="flex items-center">Close</span>
            </span>
          </span>
        </span>

        <span
          style={{ height: CIRCLE_H, width: CIRCLE_H }}
          className="inline-flex items-center justify-center rounded-full bg-gris-tan shrink-0"
        >
          <span className="flex flex-col gap-[5px]">
            <span className="block h-[2px] w-7 bg-creme/85 rounded-full" />
            <span className="block h-[2px] w-7 bg-creme/85 rounded-full" />
            <span className="block h-[2px] w-7 bg-creme/85 rounded-full" />
          </span>
        </span>
      </button>
    </>
  );
}
