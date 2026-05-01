"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMenu } from "@/components/common/MenuContext";
import { useReservePanel } from "@/components/common/ReservePanelContext";
import { SITE_CONFIG } from "@/lib/constants";
import { SCROLL_OUT } from "@/lib/motion";

const PILL_H = 72; // px — outer cream pill height
const CIRCLE_H = 56; // px — inner gris-tan circle height (h-14)

export default function Header() {
  const { toggle, isOpen } = useMenu();
  const { open: openReservePanel } = useReservePanel();
  const reserveRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const labelAreaRef = useRef<HTMLSpanElement>(null);
  const wheelRef = useRef<HTMLSpanElement>(null);

  // Initial entrance — Reserve fades in. Menu starts as a centered gris-tan circle
  // (cream pill collapsed to circle width), then the cream pill unrolls leftward
  // and the circle drifts to the right edge.
  useGSAP(() => {
    if (reserveRef.current) {
      gsap.fromTo(
        reserveRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.4, ease: "expo.out" },
      );
    }

    if (menuBtnRef.current && labelAreaRef.current) {
      gsap.set(menuBtnRef.current, { opacity: 0, scale: 0.6 });
      gsap.set(labelAreaRef.current, { width: 0 });
      // Force the wheel to its initial position so only "Menu" is visible
      // before any switch animation runs.
      if (wheelRef.current) gsap.set(wheelRef.current, { yPercent: 0 });

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.to(menuBtnRef.current, { opacity: 1, scale: 1, duration: 0.6, delay: 0.5 })
        .to(labelAreaRef.current, { width: "auto", duration: 0.85, delay: 0.45 });
    }
  });

  // iOS-wheel: only one word visible. yPercent 0 → -50 to switch.
  useGSAP(
    () => {
      if (!wheelRef.current) return;
      gsap.to(wheelRef.current, {
        yPercent: isOpen ? -50 : 0,
        duration: 0.55,
        ease: "expo.inOut",
      });
    },
    { dependencies: [isOpen] },
  );

  // Reserve scroll-out — hidden ONLY during the hero past 40%, visible elsewhere.
  // ScrollTrigger anchored to the hero element so the behavior is declarative,
  // not threshold-based. Past the hero (Manifeste etc.), Reserve is back.
  useGSAP(() => {
    const btn = reserveRef.current;
    const heroEl = document.querySelector<HTMLElement>("[data-hero]");
    if (!btn || !heroEl) return;

    const hide = () =>
      gsap.to(btn, {
        yPercent: -120,
        opacity: 0,
        duration: SCROLL_OUT.duration,
        delay: SCROLL_OUT.delay,
        ease: "expo.in",
        pointerEvents: "none" as unknown as number,
      });
    const show = () =>
      gsap.to(btn, {
        yPercent: 0,
        opacity: 1,
        duration: SCROLL_OUT.duration,
        delay: SCROLL_OUT.delay,
        ease: "expo.out",
        pointerEvents: "auto" as unknown as number,
      });

    const trigger = ScrollTrigger.create({
      trigger: heroEl,
      start: "40% top",
      end: "bottom top",
      onEnter: hide,
      onLeave: show,
      onEnterBack: hide,
      onLeaveBack: show,
    });
    return () => trigger.kill();
  });

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-7 md:p-10 pointer-events-none">
        <Link
          href="/"
          aria-label={SITE_CONFIG.name}
          className="group pointer-events-auto relative inline-flex h-9 w-9 items-center justify-center"
        >
          <span className="absolute inset-0 rounded-full border border-creme/30 transition-colors group-hover:border-creme/80" />
          <span className="relative text-creme font-semibold tracking-tight text-sm">
            {SITE_CONFIG.brandMark}
          </span>
        </Link>

        {/* Reserve CTA — cream pill EXTENDS beyond the inner gris-tan circle */}
        <button
          ref={reserveRef}
          type="button"
          onClick={openReservePanel}
          aria-label="Ouvrir le panneau de réservation"
          style={{ height: PILL_H }}
          className="pointer-events-auto inline-flex items-center rounded-pill bg-creme/95 text-lg font-medium text-base-noir transition-colors hover:bg-creme pl-7 pr-2"
        >
          <span className="pr-5">Réserver</span>
          <span
            style={{ height: CIRCLE_H, width: CIRCLE_H }}
            className="inline-flex items-center justify-center rounded-full bg-gris-tan shrink-0"
          >
            <svg
              width="16"
              height="16"
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

      {/* Menu CTA — cream pill EXTENDS beyond the inner gris-tan circle. Initial:
          label width 0 → parent width = circle area only (with the cream ring
          around). Entrance: label widens, parent grows leftward, gris-tan circle
          drifts to the right of the pill. iOS wheel for Menu↔Close. */}
      <button
        ref={menuBtnRef}
        type="button"
        onClick={toggle}
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={isOpen}
        style={{ height: PILL_H, opacity: 0 }}
        className="menu-cta fixed bottom-7 left-1/2 z-[210] -translate-x-1/2 inline-flex items-center rounded-pill bg-creme pr-2 will-change-transform"
      >
        {/* Label area — width animates 0 → auto on initial entrance.
            Strict overflow-hidden + matched height ensures only one wheel item
            is ever visible (no double-render on initial paint). */}
        <span
          ref={labelAreaRef}
          style={{ width: 0, height: CIRCLE_H }}
          className="inline-flex items-center text-lg font-medium text-base-noir overflow-hidden will-change-[width]"
        >
          <span className="block pl-7 pr-5 whitespace-nowrap">
            <span ref={wheelRef} className="block will-change-transform">
              <span style={{ height: CIRCLE_H }} className="flex items-center">Menu</span>
              <span style={{ height: CIRCLE_H }} className="flex items-center">Close</span>
            </span>
          </span>
        </span>

        {/* Gris-tan circle — smaller than the cream pill (cream visible around).
            Hamburger: 3 lines, 1.5px stroke, creme/85 to read on the gris-tan. */}
        <span
          style={{ height: CIRCLE_H, width: CIRCLE_H }}
          className="inline-flex items-center justify-center rounded-full bg-gris-tan shrink-0"
        >
          <span className="flex flex-col gap-1.5">
            <span className="block h-[1.5px] w-6 bg-creme/85 rounded-full" />
            <span className="block h-[1.5px] w-6 bg-creme/85 rounded-full" />
            <span className="block h-[1.5px] w-6 bg-creme/85 rounded-full" />
          </span>
        </span>
      </button>
    </>
  );
}
