"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useMenu } from "./MenuContext";
import { SITE_CONFIG } from "@/lib/constants";

const NAV = [
  { label: "Le manifeste", href: "#manifeste" },
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
  const ref = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (isOpen) {
        gsap.set(el, { display: "flex" });
        gsap.fromTo(
          el,
          { clipPath: "circle(0% at 50% 100%)" },
          { clipPath: "circle(150% at 50% 100%)", duration: 0.9, ease: "expo.out" },
        );
        const links = linksRef.current?.querySelectorAll("li");
        if (links) {
          gsap.fromTo(
            links,
            { yPercent: 100, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.9,
              stagger: 0.05,
              delay: 0.3,
              ease: "expo.out",
            },
          );
        }
      } else {
        gsap.to(el, {
          clipPath: "circle(0% at 50% 100%)",
          duration: 0.6,
          ease: "expo.in",
          onComplete: () => gsap.set(el, { display: "none" }),
        });
      }
    },
    { dependencies: [isOpen] },
  );

  // Close on Escape
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
      ref={ref}
      className="fixed inset-0 z-[200] hidden flex-col bg-base-noir px-5 md:px-10 pt-24 pb-32"
      style={{ clipPath: "circle(0% at 50% 100%)" }}
      aria-hidden={!isOpen}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <div className="flex items-center justify-between">
          <span className="text-creme text-2xl font-semibold tracking-tight">
            {SITE_CONFIG.name}
          </span>
          <button
            type="button"
            onClick={close}
            className="inline-flex items-center gap-3 rounded-full border border-creme/20 px-5 py-2.5 text-sm text-creme hover:border-creme/60 transition-colors"
            aria-label="Fermer le menu"
          >
            Fermer
            <span className="relative h-3 w-3">
              <span className="absolute left-1/2 top-1/2 block h-px w-full -translate-x-1/2 -translate-y-1/2 rotate-45 bg-creme" />
              <span className="absolute left-1/2 top-1/2 block h-px w-full -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-creme" />
            </span>
          </button>
        </div>

        <nav className="flex flex-1 items-center">
          <ul ref={linksRef} className="space-y-3 md:space-y-5">
            {NAV.map((item, i) => (
              <li key={item.href} className="overflow-hidden">
                <a
                  href={item.href}
                  onClick={close}
                  className="group flex items-baseline gap-6 text-creme text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-none hover:text-orange-sunset transition-colors"
                >
                  <span className="text-creme-dim/40 text-sm font-normal tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="block">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-12 flex flex-col gap-2 text-sm text-creme-dim md:flex-row md:items-center md:justify-between">
          <p>{SITE_CONFIG.heroTagline}</p>
          <p>Charlevoix — Québec</p>
        </div>
      </div>
    </div>
  );
}
