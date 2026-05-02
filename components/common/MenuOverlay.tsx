"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useMenu } from "./MenuContext";
import { PANEL } from "@/lib/motion";
import Marquee from "./Marquee";

const NAV = [
  { label: "Accueil", href: "#" },
  { label: "Introduction", href: "#manifeste" },
  { label: "Refuges", href: "#refuges" },
  { label: "Pourquoi Brume®", href: "#choisir" },
  { label: "Feedback", href: "#feedback" },
];

export default function MenuOverlay() {
  const { isOpen, close } = useMenu();
  const containerRef = useRef<HTMLDivElement>(null);
  const imagePanelRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);

  // Sync initial state with GSAP cache
  useGSAP(() => {
    if (containerRef.current) {
      gsap.set(containerRef.current, {
        autoAlpha: 0,
        pointerEvents: "none",
        clipPath: "circle(0% at 50% 100%)",
      });
    }
    if (imagePanelRef.current) gsap.set(imagePanelRef.current, { xPercent: 110 });
    if (navRef.current) {
      const items = navRef.current.querySelectorAll("li > a");
      gsap.set(items, { yPercent: 110, opacity: 0 });
    }
  }, []);

  useGSAP(
    () => {
      const container = containerRef.current;
      const imagePanel = imagePanelRef.current;
      const navItems = navRef.current?.querySelectorAll("li > a");
      if (!container || !navItems) return;

      if (isOpen) {
        gsap.to(container, {
          autoAlpha: 1,
          pointerEvents: "auto",
          clipPath: "circle(150% at 50% 100%)",
          duration: 0.85,
          ease: PANEL.ease,
        });
        if (imagePanel) {
          gsap.to(imagePanel, {
            xPercent: 0,
            duration: 0.8,
            ease: PANEL.ease,
            delay: 0.15,
          });
        }
        gsap.to(navItems, {
          yPercent: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.05,
          delay: 0.3,
          ease: PANEL.ease,
        });
      } else {
        gsap.to(navItems, {
          yPercent: 110,
          opacity: 0,
          duration: 0.35,
          stagger: 0.02,
          ease: PANEL.closeEase,
        });
        if (imagePanel) {
          gsap.to(imagePanel, {
            xPercent: 110,
            duration: 0.5,
            ease: PANEL.closeEase,
            delay: 0.1,
          });
        }
        gsap.to(container, {
          autoAlpha: 0,
          pointerEvents: "none",
          clipPath: "circle(0% at 50% 100%)",
          duration: 0.55,
          ease: PANEL.closeEase,
          delay: 0.25,
        });
      }
    },
    { dependencies: [isOpen] },
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[290] p-3 md:p-4"
      aria-hidden={!isOpen}
    >
      {/* Inner frame — rounded corners matching Hero, sits inside outer padding */}
      <div className="relative h-full w-full overflow-hidden rounded-[60px] bg-gris-tan">
        {/* Layout split — nav left + image right */}
        <div className="relative z-[2] flex h-full">
          {/* LEFT — nav vertical, anchored TOP (not centered) */}
          <div className="flex-1 md:basis-[75%] flex flex-col px-6 md:px-12 pt-32 md:pt-40 pb-10">
            <ul ref={navRef} className="w-full space-y-1 md:space-y-2">
              {NAV.map((item) => (
                <li key={item.href} className="overflow-hidden">
                  <a
                    href={item.href}
                    onClick={close}
                    className="block text-creme-terre/70 text-4xl md:text-5xl lg:text-[5.5vw] font-semibold tracking-tight leading-[1.1] hover:text-creme transition-colors duration-500 ease-out"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Bottom — social icons LEFT, concept disclaimer RIGHT (bigger, bold) */}
            <div className="mt-auto flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
              <div className="flex items-center gap-4 shrink-0">
                <a
                  href="https://www.instagram.com/patrickpatenaude/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram — Patrick Patenaude"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-creme/20 text-creme/70 hover:text-creme hover:border-creme/60 transition-colors duration-300"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/patrickpatenaude"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn — Patrick Patenaude"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-creme/20 text-creme/70 hover:text-creme hover:border-creme/60 transition-colors duration-300"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </a>
              </div>
              <p className="text-creme-dim text-sm md:text-base font-semibold max-w-xl leading-relaxed">
                Ce site web est juste un concept de projet réalisé par moi pour démontrer mes capacités.
              </p>
            </div>
          </div>

          {/* RIGHT — cropped image with the wordmark marquee inside, centered vertically */}
          <div
            ref={imagePanelRef}
            className="hidden md:block md:basis-[25%] relative overflow-hidden rounded-l-card"
          >
            <Image
              src="/images/unite-galets.avif"
              alt=""
              fill
              sizes="25vw"
              className="object-cover object-[60%_40%]"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-base-noir/15 via-base-noir/35 to-base-noir/15" />
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none select-none">
              <Marquee
                text="Brume®"
                speed={120}
                separator="·"
                className="text-creme/95 text-[18vw] md:text-[12vw] font-semibold leading-none tracking-[-0.04em] whitespace-nowrap"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
