"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useMenu } from "./MenuContext";
import { PANEL } from "@/lib/motion";
import { SITE_CONFIG } from "@/lib/constants";
import { BP } from "@/lib/breakpoints";
import { CTA } from "@/lib/cta-dimensions";
import Marquee from "./Marquee";

const NAV = [
  { label: "Accueil", href: "#" },
  { label: "Introduction", href: "#manifeste" },
  { label: "Refuges", href: "#refuges" },
  { label: `Pourquoi ${SITE_CONFIG.brandMark} ?`, href: "#choisir" },
  { label: "Feedback", href: "#feedback" },
];

/** Margin between the open box and the viewport edges. */
const GAP = 12;
/** Border-radius at the fully-open state. The closed state uses 9999 (cap)
 *  so `min(width, height)/2` produces a perfect pill at the small size. */
const RADIUS_OPEN = 60;
const RADIUS_CLOSED = 9999;

/** Computes the closed box rect (Menu CTA pill footprint) from the current
 *  viewport size. Reads dimensions from {@link CTA} so the collapse origin
 *  always matches what `Header.tsx` actually renders — no manual sync. */
function getClosedRect() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isMobile = vw < BP.md;
  const ctaW = isMobile ? CTA.width.mobile : CTA.width.desktop;
  const ctaH = isMobile ? CTA.pillH.mobile : CTA.pillH.desktop;
  const ctaBottom = isMobile ? CTA.bottom.mobile : CTA.bottom.desktop;
  return {
    top: vh - ctaH - ctaBottom,
    left: vw / 2 - ctaW / 2,
    right: vw / 2 - ctaW / 2,
    bottom: ctaBottom,
  };
}

/**
 * Fullscreen Menu overlay. A black backdrop plus a `bg-gris-tan` rounded
 * box that physically grows from the Menu CTA pill into a near-fullscreen
 * card (no clip-path masking — actual `top/right/bottom/left` + radius
 * animation, so corners stay pixel-perfect at every frame).
 *
 * Driven by {@link useMenu} — must sit inside a `MenuProvider`. Inner
 * content (nav, image panel, social links, concept paragraph) staggers
 * in after the box reaches its open state and out before the box retracts.
 * Every tween uses `overwrite: true` so a re-toggle mid-animation gracefully
 * reverses from the current value instead of stacking conflicting tweens.
 */
export default function MenuOverlay() {
  const { isOpen, close } = useMenu();
  const backdropRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const imagePanelRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const socialsRef = useRef<HTMLDivElement>(null);
  const conceptRef = useRef<HTMLParagraphElement>(null);

  const socialIconCls =
    "inline-flex h-14 w-14 items-center justify-center rounded-full border border-creme/20 text-creme/70 hover:text-creme hover:border-creme/60 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-2 focus-visible:ring-offset-gris-tan";

  useGSAP(() => {
    if (backdropRef.current) {
      gsap.set(backdropRef.current, { autoAlpha: 0 });
    }
    if (boxRef.current) {
      const r = getClosedRect();
      gsap.set(boxRef.current, {
        top: r.top,
        left: r.left,
        right: r.right,
        bottom: r.bottom,
        borderRadius: RADIUS_CLOSED,
        autoAlpha: 0,
        pointerEvents: "none",
      });
    }
    if (imagePanelRef.current) gsap.set(imagePanelRef.current, { xPercent: 110 });
    if (navRef.current) {
      const items = navRef.current.querySelectorAll("li > a");
      gsap.set(items, { yPercent: 110, opacity: 0 });
    }
    if (socialsRef.current) {
      const icons = socialsRef.current.querySelectorAll("a");
      gsap.set(icons, { yPercent: 100, opacity: 0 });
    }
    if (conceptRef.current) gsap.set(conceptRef.current, { x: -16, opacity: 0 });
  }, []);

  useGSAP(
    () => {
      const backdrop = backdropRef.current;
      const box = boxRef.current;
      const imagePanel = imagePanelRef.current;
      const navItems = navRef.current?.querySelectorAll("li > a");
      const socialIcons = socialsRef.current?.querySelectorAll("a");
      const concept = conceptRef.current;
      if (!backdrop || !box || !navItems) return;

      // overwrite: true on every tween — a re-toggle mid-animation kills
      // the in-flight tweens and starts the new direction from whatever
      // value GSAP left them at, so a double-click never produces stacked
      // / fighting tweens. No input lock needed.
      if (isOpen) {
        gsap.to(backdrop, {
          autoAlpha: 1,
          duration: 0.45,
          ease: PANEL.ease,
          overwrite: true,
        });

        // Box grows from the Menu CTA pill footprint to a fullscreen
        // rounded card. borderRadius is recomputed each frame as a blend
        // of the current pill cap (min(w,h)/2) and RADIUS_OPEN so corners
        // morph continuously from the first frame.
        gsap.set(box, { autoAlpha: 1, pointerEvents: "auto" });
        gsap.to(box, {
          top: GAP,
          left: GAP,
          right: GAP,
          bottom: GAP,
          duration: 0.85,
          ease: PANEL.ease,
          overwrite: true,
          onUpdate: function () {
            const p = this.progress();
            const rect = box.getBoundingClientRect();
            const cap = Math.min(rect.width, rect.height) / 2;
            const target = cap + (RADIUS_OPEN - cap) * p;
            box.style.borderRadius = `${Math.min(target, cap)}px`;
          },
        });

        if (imagePanel) {
          gsap.to(imagePanel, {
            xPercent: 0,
            duration: 0.8,
            ease: PANEL.ease,
            delay: 0.15,
            overwrite: true,
          });
        }
        gsap.to(navItems, {
          yPercent: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.05,
          delay: 0.3,
          ease: PANEL.ease,
          overwrite: true,
        });
        if (socialIcons && socialIcons.length) {
          gsap.to(socialIcons, {
            yPercent: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.08,
            delay: 0.7,
            ease: PANEL.ease,
            overwrite: true,
          });
        }
        if (concept) {
          gsap.to(concept, {
            x: 0,
            opacity: 1,
            duration: 0.7,
            delay: 0.85,
            ease: PANEL.ease,
            overwrite: true,
          });
        }
      } else {
        if (concept) {
          gsap.to(concept, {
            x: -16,
            opacity: 0,
            duration: 0.25,
            ease: PANEL.closeEase,
            overwrite: true,
          });
        }
        if (socialIcons && socialIcons.length) {
          gsap.to(socialIcons, {
            yPercent: 100,
            opacity: 0,
            duration: 0.25,
            stagger: 0.03,
            ease: PANEL.closeEase,
            overwrite: true,
          });
        }
        gsap.to(navItems, {
          yPercent: 110,
          opacity: 0,
          duration: 0.35,
          stagger: 0.02,
          ease: PANEL.closeEase,
          overwrite: true,
        });
        if (imagePanel) {
          gsap.to(imagePanel, {
            xPercent: 110,
            duration: 0.5,
            ease: PANEL.closeEase,
            delay: 0.1,
            overwrite: true,
          });
        }

        const r = getClosedRect();
        gsap.to(box, {
          top: r.top,
          left: r.left,
          right: r.right,
          bottom: r.bottom,
          duration: 0.7,
          ease: PANEL.closeEase,
          delay: 0.25,
          overwrite: true,
          onUpdate: function () {
            const p = this.progress();
            const rect = box.getBoundingClientRect();
            const cap = Math.min(rect.width, rect.height) / 2;
            const target = RADIUS_OPEN + (cap - RADIUS_OPEN) * p;
            box.style.borderRadius = `${Math.min(target, cap)}px`;
          },
          onComplete: () => {
            gsap.set(box, {
              autoAlpha: 0,
              pointerEvents: "none",
              borderRadius: RADIUS_CLOSED,
            });
          },
        });

        gsap.to(backdrop, {
          autoAlpha: 0,
          duration: 0.5,
          ease: PANEL.closeEase,
          delay: 0.45,
          overwrite: true,
        });
      }
    },
    { dependencies: [isOpen] },
  );

  // Keep the closed-state coordinates in sync with viewport size, so a
  // resize while the menu is closed doesn't leave the box at a stale spot
  // for the next open animation.
  useEffect(() => {
    const onResize = () => {
      if (isOpen || !boxRef.current) return;
      const r = getClosedRect();
      gsap.set(boxRef.current, {
        top: r.top,
        left: r.left,
        right: r.right,
        bottom: r.bottom,
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isOpen]);

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
    <>
      {/* Backdrop noir plein écran derrière la boîte */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[289] bg-base-noir invisible pointer-events-none"
        aria-hidden
      />

      {/* Boîte menu — vrai élément fixed qui s'anime en taille réelle.
          Pas de clip-path : les coins arrondis sont sur l'élément lui-même
          et restent pixel-perfect à chaque frame. */}
      <div
        ref={boxRef}
        // data-lenis-prevent: opt the menu out of Lenis interception so any
        // overflow inside scrolls natively on touch devices.
        data-lenis-prevent
        className="fixed z-[290] overflow-hidden bg-gris-tan invisible pointer-events-none"
        aria-hidden={!isOpen}
      >
        <div className="relative z-[2] flex h-full">
          <div className="flex-1 md:basis-[75%] flex flex-col px-6 md:px-12 pt-24 md:pt-40 pb-32 md:pb-10">
            <ul ref={navRef} className="w-full space-y-4 md:space-y-3">
              {NAV.map((item) => (
                <li key={item.href} className="overflow-hidden pb-1">
                  <a
                    href={item.href}
                    onClick={close}
                    className="block text-creme-terre/70 text-[2.5rem] xs:text-[3.25rem] leading-[1.15] md:text-5xl lg:text-[5.5vw] font-semibold tracking-tight md:leading-[1.2] hover:text-creme transition-colors duration-500 ease-out focus-visible:outline-none focus-visible:text-creme rounded-sm"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
              <div ref={socialsRef} className="flex items-center gap-4 shrink-0">
                <a
                  href="https://www.instagram.com/patrickpatenaude/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram — Patrick Patenaude"
                  className={socialIconCls}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
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
                  className={socialIconCls}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </a>
              </div>
              <p ref={conceptRef} className="text-creme-dim text-sm md:text-base font-semibold max-w-xl leading-relaxed">
                Ce site web est juste un concept de projet réalisé par moi pour démontrer mes capacités.
              </p>
            </div>
          </div>

          <div
            ref={imagePanelRef}
            className="hidden md:block md:basis-[25%] relative overflow-hidden rounded-l-card"
          >
            <Image
              src="/images/unite-brume.avif"
              alt=""
              fill
              sizes="25vw"
              // Source AVIFs (2400×1340, ~150KB) are already optimized.
              // Next's default re-encode at quality 75 visibly softens them
              // — match Capsules.tsx and serve the source directly.
              unoptimized
              className="object-cover object-[45%_40%]"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-base-noir/15 via-base-noir/35 to-base-noir/15" />
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none select-none">
              <Marquee
                text={SITE_CONFIG.brandMark}
                speed={120}
                separator="·"
                className="text-creme/95 text-[18vw] md:text-[12vw] font-semibold leading-none tracking-[-0.04em] whitespace-nowrap"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
