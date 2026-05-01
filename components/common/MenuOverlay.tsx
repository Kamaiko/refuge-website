"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useMenu } from "./MenuContext";
import { SITE_CONFIG } from "@/lib/constants";
import { PANEL } from "@/lib/motion";
import Marquee from "./Marquee";

const NAV = [
  { label: "Accueil", href: "#" },
  { label: "Manifeste", href: "#manifeste" },
  { label: "Le lieu", href: "#lieu" },
  { label: "Concept", href: "#concept" },
  { label: "Les refuges", href: "#refuges" },
  { label: "Expériences", href: "#experiences" },
  { label: "Galerie", href: "#galerie" },
  { label: "Journal", href: "#journal" },
  { label: "Réservation", href: "#reservation" },
];

export default function MenuOverlay() {
  const { isOpen, close } = useMenu();
  const containerRef = useRef<HTMLDivElement>(null);
  const imagePanelRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);

  // Sync initial state with GSAP cache
  useGSAP(() => {
    if (containerRef.current) {
      gsap.set(containerRef.current, { autoAlpha: 0, pointerEvents: "none" });
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
          duration: 0.4,
          ease: PANEL.ease,
        });
        if (imagePanel) {
          gsap.to(imagePanel, {
            xPercent: 0,
            duration: 0.8,
            ease: PANEL.ease,
            delay: 0.1,
          });
        }
        gsap.to(navItems, {
          yPercent: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.05,
          delay: 0.25,
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
          duration: 0.3,
          ease: PANEL.closeEase,
          delay: 0.35,
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
      className="fixed inset-0 z-[200] bg-base-noir"
      aria-hidden={!isOpen}
    >
      {/* Marquee wordmark — full-width back layer, very dim */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 z-[1] flex items-center select-none">
        <Marquee
          text={SITE_CONFIG.name}
          speed={40}
          separator="·"
          className="text-creme/[0.06] text-[22vw] md:text-[18vw] font-semibold leading-none tracking-[-0.04em]"
        />
      </div>

      {/* Layout split — nav left + image right */}
      <div className="relative z-[2] flex h-full">
        {/* LEFT — nav vertical */}
        <div className="flex-1 md:basis-[58%] flex flex-col p-5 md:p-10 pt-24 pb-24">
          <div className="flex-1 flex items-center">
            <ul ref={navRef} className="w-full space-y-1 md:space-y-2">
              {NAV.map((item, i) => (
                <li key={item.href} className="overflow-hidden">
                  <a
                    href={item.href}
                    onClick={close}
                    className="group flex items-baseline gap-6 text-creme text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] hover:text-creme-dim transition-colors"
                  >
                    <span className="text-creme-dim/40 text-xs font-normal tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="block">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom utility row */}
          <div className="flex flex-col gap-2 text-xs text-creme-dim md:flex-row md:items-center md:gap-6">
            <a href="#" className="hover:text-creme transition-colors">Instagram</a>
            <a href="#" className="hover:text-creme transition-colors">Bulletin saisonnier</a>
            <a href="mailto:bonjour@brume.ca" className="hover:text-creme transition-colors">
              bonjour@brume.ca
            </a>
          </div>
        </div>

        {/* RIGHT — cropped image (desktop only) */}
        <div
          ref={imagePanelRef}
          className="hidden md:block md:basis-[42%] relative overflow-hidden rounded-l-card my-6 mr-6"
        >
          <Image
            src="/images/unite-galets.avif"
            alt=""
            fill
            sizes="42vw"
            className="object-cover object-[60%_40%]"
            priority={false}
          />
          {/* Soft fade on the inner edge so the image meets the dark side smoothly */}
          <div className="absolute inset-0 bg-gradient-to-r from-base-noir/40 via-transparent to-transparent" />
        </div>
      </div>

      {/* Close pill — bottom center, mirrors Menu CTA */}
      <button
        type="button"
        onClick={close}
        aria-label="Fermer le menu"
        className="absolute bottom-6 left-1/2 z-[3] -translate-x-1/2 inline-flex items-center gap-3 rounded-pill bg-creme/95 px-5 py-3 text-sm font-medium text-base-noir backdrop-blur-sm transition-colors hover:bg-creme"
      >
        Fermer
        <span className="relative h-3 w-3">
          <span className="absolute left-1/2 top-1/2 block h-px w-full -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
          <span className="absolute left-1/2 top-1/2 block h-px w-full -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current" />
        </span>
      </button>
    </div>
  );
}
