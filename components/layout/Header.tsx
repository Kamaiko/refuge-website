"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const menuLabelRef = useRef<HTMLSpanElement>(null);
  const [menuMorphed, setMenuMorphed] = useState(false);

  // Initial reveal — Reserve fades in from above, Menu morphs from circle to pill
  useGSAP(() => {
    // Reserve button entrance
    if (reserveRef.current) {
      gsap.fromTo(
        reserveRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.4, ease: "expo.out" },
      );
    }

    // Menu CTA — visible at load as a small circle, then morphs to pill with label
    if (menuBtnRef.current && menuLabelRef.current) {
      gsap.fromTo(
        menuBtnRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, delay: 0.6, ease: "expo.out" },
      );
      // After the circle is in, morph to pill with label
      gsap.delayedCall(1.4, () => setMenuMorphed(true));
    }
  });

  // Reserve scroll-out — disappears upward past 40% of the hero
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

  // Sync the morphed state attribute for CSS-driven label reveal
  useEffect(() => {
    if (!menuBtnRef.current) return;
    menuBtnRef.current.setAttribute("data-morphed", menuMorphed ? "true" : "false");
  }, [menuMorphed]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-5 md:p-7 pointer-events-none">
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

        <button
          ref={reserveRef}
          type="button"
          onClick={openReservePanel}
          className="group pointer-events-auto inline-flex items-center gap-3 rounded-pill bg-creme/95 px-6 py-3 text-base font-medium text-base-noir backdrop-blur-sm transition-colors hover:bg-creme"
        >
          Réserver
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
        </button>
      </header>

      {/* Side badge — vertical text right edge */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] pointer-events-none">
        <div className="rounded-l-md bg-base-noir/80 backdrop-blur-sm px-2 py-4 text-creme/80 text-[10px] uppercase tracking-[0.3em] [writing-mode:vertical-rl]">
          Concept · 2026
        </div>
      </div>

      {/* Floating Menu CTA — visible from page load, morphs from circle to pill */}
      <button
        ref={menuBtnRef}
        type="button"
        onClick={toggle}
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={isOpen}
        data-morphed="false"
        className="menu-cta fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 inline-flex items-center justify-center rounded-pill bg-creme/95 text-base font-medium text-base-noir backdrop-blur-sm hover:bg-creme will-change-transform overflow-hidden h-14"
        style={{ opacity: 0, transform: "translateX(-50%) scale(0)" }}
      >
        <span
          ref={menuLabelRef}
          className="menu-cta-label inline-block whitespace-nowrap overflow-hidden"
          style={{
            maxWidth: 0,
            opacity: 0,
            marginLeft: 0,
            marginRight: 0,
            transition:
              "max-width 0.7s var(--ease-cinematic), opacity 0.5s var(--ease-cinematic), margin 0.7s var(--ease-cinematic)",
          }}
        >
          {isOpen ? "Fermer" : "Menu"}
        </span>
        <span className="inline-flex items-center justify-center h-14 w-14 shrink-0">
          <span className="flex flex-col gap-1.5">
            <span
              className={`block h-px w-5 bg-current transition-transform duration-300 ${
                isOpen ? "translate-y-1 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-5 bg-current transition-transform duration-300 ${
                isOpen ? "-translate-y-1 -rotate-45" : ""
              }`}
            />
          </span>
        </span>
      </button>
    </>
  );
}
