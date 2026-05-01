"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMenu } from "@/components/common/MenuContext";
import { SITE_CONFIG } from "@/lib/constants";

export default function Header() {
  const { toggle, isOpen } = useMenu();
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const reserveRef = useRef<HTMLAnchorElement>(null);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  // Menu CTA fades / scales in only after scrolling past hero
  useGSAP(() => {
    if (!menuBtnRef.current) return;
    gsap.set(menuBtnRef.current, { scale: 0, opacity: 0 });
    ScrollTrigger.create({
      start: "top -10%",
      end: "max",
      onUpdate: (self) => {
        const past = self.progress > 0;
        setScrolledPastHero(past);
      },
      onEnter: () => {
        gsap.to(menuBtnRef.current, {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "expo.out",
        });
      },
      onLeaveBack: () => {
        gsap.to(menuBtnRef.current, {
          scale: 0,
          opacity: 0,
          duration: 0.4,
          ease: "expo.in",
        });
      },
    });
  });

  // Initial reveal of header chrome (logo + reserve)
  useEffect(() => {
    if (!reserveRef.current) return;
    gsap.fromTo(
      [reserveRef.current],
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.9, delay: 0.4, ease: "expo.out" },
    );
  }, []);

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

        <Link
          ref={reserveRef}
          href="#reservation"
          className="group pointer-events-auto inline-flex items-center gap-3 rounded-full bg-creme/95 px-5 py-2.5 text-sm font-medium text-base-noir backdrop-blur-sm transition-colors hover:bg-creme"
        >
          Réserver
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
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
        </Link>
      </header>

      {/* Side badge — vertical text right edge */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] pointer-events-none">
        <div className="rounded-l-md bg-base-noir/80 backdrop-blur-sm px-2 py-4 text-creme/80 text-[10px] uppercase tracking-[0.3em] [writing-mode:vertical-rl]">
          Concept · 2026
        </div>
      </div>

      {/* Floating Menu CTA — appears after scrolling past hero */}
      <button
        ref={menuBtnRef}
        type="button"
        onClick={toggle}
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={isOpen}
        className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 inline-flex items-center gap-3 rounded-full bg-creme/95 px-5 py-3 text-sm font-medium text-base-noir backdrop-blur-sm transition-colors hover:bg-creme will-change-transform"
        style={{ opacity: 0, transform: "translateX(-50%) scale(0)" }}
      >
        {isOpen ? "Fermer" : "Menu"}
        <span className="flex flex-col gap-1">
          <span className={`block h-px w-3.5 bg-current transition-transform ${isOpen ? "translate-y-0.5 rotate-45" : ""}`} />
          <span className={`block h-px w-3.5 bg-current transition-transform ${isOpen ? "-translate-y-0.5 -rotate-45" : ""}`} />
        </span>
      </button>
    </>
  );
}
