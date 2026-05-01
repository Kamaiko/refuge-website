"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMenu } from "@/components/common/MenuContext";
import { useReservePanel } from "@/components/common/ReservePanelContext";
import { SITE_CONFIG } from "@/lib/constants";

export default function Header() {
  const { toggle, isOpen } = useMenu();
  const { open: openReservePanel } = useReservePanel();
  const reserveRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const labelAreaRef = useRef<HTMLSpanElement>(null);
  const wheelRef = useRef<HTMLSpanElement>(null);

  // Initial entrance — Reserve fades in. Menu starts as a centered black circle,
  // then the white pill unrolls to the LEFT and the label area widens. The
  // parent stays viewport-centered via -translate-x-1/2, so as it grows the
  // black circle visually "drifts" rightward to its final position.
  useGSAP(() => {
    if (reserveRef.current) {
      gsap.fromTo(
        reserveRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.4, ease: "expo.out" },
      );
    }

    if (menuBtnRef.current && labelAreaRef.current) {
      // Initial: button hidden, label width 0 (parent = circle width only)
      gsap.set(menuBtnRef.current, { opacity: 0, scale: 0.6 });
      gsap.set(labelAreaRef.current, { width: 0 });

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.to(menuBtnRef.current, { opacity: 1, scale: 1, duration: 0.6, delay: 0.5 })
        .to(labelAreaRef.current, { width: "auto", duration: 0.85, delay: 0.45 });
    }
  });

  // iOS-wheel: only one word visible at any time. yPercent 0 → -50 to switch.
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

  // Reserve scroll-out at 40% of hero
  useGSAP(() => {
    if (!reserveRef.current) return;
    const trigger = ScrollTrigger.create({
      start: () => `${window.innerHeight * 0.4} top`,
      end: "max",
      onEnter: () =>
        gsap.to(reserveRef.current, {
          y: -80,
          opacity: 0,
          duration: 0.5,
          ease: "expo.in",
          pointerEvents: "none" as unknown as number,
        }),
      onLeaveBack: () =>
        gsap.to(reserveRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "expo.out",
          pointerEvents: "auto" as unknown as number,
        }),
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

        {/* Reserve CTA — same format as Menu: pill with black circle on right */}
        <button
          ref={reserveRef}
          type="button"
          onClick={openReservePanel}
          aria-label="Ouvrir le panneau de réservation"
          className="pointer-events-auto inline-flex items-stretch h-14 rounded-pill bg-creme/95 text-base font-medium text-base-noir transition-colors hover:bg-creme overflow-hidden"
        >
          <span className="inline-flex items-center pl-6 pr-3">Réserver</span>
          <span className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-base-noir shrink-0">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="text-creme"
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

      {/* Side badge — vertical text right edge */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] pointer-events-none">
        <div className="rounded-l-md bg-base-noir/80 backdrop-blur-sm px-2 py-4 text-creme/80 text-[10px] uppercase tracking-[0.3em] [writing-mode:vertical-rl]">
          Concept · 2026
        </div>
      </div>

      {/* Menu CTA — black circle centered initially, white pill unrolls to the
          left, circle drifts right. iOS-wheel for Menu↔Close.
          z-[210] keeps it above MenuOverlay (z-[200]). */}
      <button
        ref={menuBtnRef}
        type="button"
        onClick={toggle}
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={isOpen}
        className="menu-cta fixed bottom-7 left-1/2 z-[210] -translate-x-1/2 inline-flex items-stretch h-16 rounded-pill bg-creme overflow-hidden will-change-transform"
        style={{ opacity: 0 }}
      >
        {/* Label area — width animates 0 → auto on initial entrance */}
        <span
          ref={labelAreaRef}
          className="inline-flex items-center text-base font-medium text-base-noir overflow-hidden h-16 will-change-[width]"
          style={{ width: 0 }}
        >
          <span className="block pl-7 pr-4 whitespace-nowrap">
            <span ref={wheelRef} className="block will-change-transform">
              <span className="block h-16 leading-[64px]">Menu</span>
              <span className="block h-16 leading-[64px]">Close</span>
            </span>
          </span>
        </span>

        {/* Black circle — always visible, on the right of the pill */}
        <span className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-base-noir shrink-0">
          <span className="flex flex-col gap-1.5">
            <span className="block h-px w-5 bg-gris-secondaire" />
            <span className="block h-px w-5 bg-gris-secondaire" />
          </span>
        </span>
      </button>
    </>
  );
}
