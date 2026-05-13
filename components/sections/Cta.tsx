"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { SITE_CONFIG } from "@/lib/constants";
import { NAV } from "@/lib/data/nav";
import Marquee from "@/components/common/Marquee";
import NavWheelLink from "@/components/common/NavWheelLink";

const MARQUEE_TEXT = "Réservez votre refuge";

const socialIconCls =
  "inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-creme-dim/60 text-creme hover:border-creme transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-2 focus-visible:ring-offset-base-noir";

/**
 * Closing CTA section. A static marquee scrolls "Réservez votre refuge"
 * horizontally; pointer-enter pauses the ribbon AND crossfades the whole
 * text from `creme` to `creme-terre/70` (the brand's secondary text tone,
 * matching the "L'un se dérobe..." copy in Choisir).
 *
 * Side rails (mirror capsules' final CTA) :
 *  - Top-left  : intro copy with scroll-scrub fade-in (like Choisir's
 *    eyebrow `Découvrir les refuges Aquilon`).
 *  - Bottom-left : concept paragraph + social icons (LinkedIn + Instagram).
 *  - Bottom-right : nav stack with per-link iOS-wheel flip on hover.
 *
 * Hover state is React-driven (not GSAP-state) — the Marquee's
 * `pauseOnHover` owns its own pause flag, so React only mirrors the
 * boolean to drive the color crossfade className.
 */
export default function Cta() {
  const [hovered, setHovered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);

  // Intro fade-in scrubbed over a ~50svh window, identical pattern to the
  // Choisir eyebrow. Pre-hidden via inline style on the element so there's
  // no SSR flash before the ScrollTrigger applies its `from` state.
  useGSAP(
    () => {
      if (!introRef.current) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          introRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: introRef.current,
              start: "top 80%",
              end: "top 45%",
              scrub: true,
            },
          },
        );
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (introRef.current) gsap.set(introRef.current, { opacity: 1, y: 0 });
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="cta"
      // `flex flex-col` + explicit margins on each block (not
      // `justify-between`) so the visible empty space around the
      // marquee is small instead of stretching to fill 100svh.
      // `mt-auto` on the bottom rail pushes it to the section's
      // bottom; the marquee sits naturally between the intro and
      // the rail. No `bg-base-noir` here — the parent wrapper in
      // `app/page.tsx` owns the base-noir → gris-tan gradient that
      // spans CTA's lower half + the entire Footer below; an opaque
      // bg here would paint over it.
      className="relative w-full min-h-[100svh] flex flex-col px-8 md:px-12 pt-24 md:pt-32 pb-32 md:pb-16"
    >
      {/* Top-left intro copy. Scroll-fade scrubbed via the useGSAP above.
          Pre-hidden on mount with inline style to prevent SSR flash. */}
      <p
        ref={introRef}
        style={{ opacity: 0 }}
        className="text-creme text-base md:text-lg font-semibold leading-snug max-w-md"
      >
        Le moment est venu de ralentir.
        <br />
        Votre refuge vous attend.
      </p>

      {/* Marquee. Wrapper applies the color transition — text-creme on
          the wrapper cascades to the Marquee's inner spans by
          inheritance, and `transition-colors duration-700` smoothly
          interpolates the inherited value on hover. The Marquee owns
          both the ticker pause AND the hover detection (cursor tracking
          + scroll hit-test, so a still cursor under a scrolling marquee
          is still detected). `onPauseChange` reports the canonical
          hover state up here so the color crossfade stays in sync
          with the pause — no longer separately driven by JSX-level
          pointer events that miss scroll-into / scroll-out-of cases.
          `pb-[0.12em]` reserves descender space below the baseline
          since `leading-[1.05]` is tight — without it 'g', 'p', 'q'
          get clipped by Marquee's overflow-hidden wrap. */}
      <div
        className={`mt-8 md:mt-10 mb-8 md:mb-12 transition-colors duration-700 ease-out ${
          hovered ? "text-creme-terre/70" : "text-creme"
        }`}
      >
        <Marquee
          text={MARQUEE_TEXT}
          speed={220}
          mobileSpeed={160}
          directional
          scrollBoost
          pauseOnHover
          onPauseChange={setHovered}
          className="text-[11vw] md:text-[9vw] font-medium leading-[1.05] tracking-[-0.04em] pb-[0.12em]"
        />
      </div>

      {/* Bottom rail. `mt-auto` pushes it to the section's bottom; the
          inner stack puts concept + nav on the same row (with nav anchored
          to the concept paragraph's bottom — NOT to the socials below it),
          then socials in a separate row below so the nav sits visibly
          higher than the social icons. */}
      <div className="mt-auto flex flex-col gap-8 md:gap-10">
        <div className="flex flex-col-reverse md:flex-row md:items-end md:justify-between gap-12">
          {/* Paragraph tone matches Choisir's "L'un se dérobe..." copy
              (`text-creme-terre/70`) so the secondary text reads with
              the same warm muted weight site-wide. The inline links
              override back to `text-creme-dim` to preserve their
              previous cream tint as a distinct "actionable" tone
              against the warmer paragraph. */}
          <p className="text-creme-terre/70 text-lg xs:text-xl md:text-3xl lg:text-4xl font-medium leading-snug max-w-3xl">
            Ce site est un concept de portfolio par&nbsp;
            <a
              href="https://www.linkedin.com/in/patrickpatenaude"
              target="_blank"
              rel="noopener noreferrer"
              className="text-creme-dim underline underline-offset-4 hover:text-creme transition-colors duration-300"
            >
              Patrick Patenaude
            </a>
            . Si vous voulez un site sur-mesure pour votre marque,&nbsp;
            <a
              href="https://www.linkedin.com/in/patrickpatenaude"
              target="_blank"
              rel="noopener noreferrer"
              className="text-creme-dim underline underline-offset-4 hover:text-creme transition-colors duration-300"
            >
              écrivez-moi
            </a>
            .
          </p>

          <nav
            aria-label={`Navigation ${SITE_CONFIG.name}`}
            className="flex flex-col items-start md:items-end gap-1 md:gap-2 text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight"
          >
            {NAV.map((item) => (
              <NavWheelLink key={item.href} label={item.label} href={item.href} />
            ))}
          </nav>
        </div>

        {/* Social icons — their own row below the rail. Border uses
            `creme-dim/60` (the secondary text tone) with `border-2`; SVG
            strokes inherit `text-creme` so the glyphs themselves read as
            crisp white. */}
        <div className="flex items-center gap-4">
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
          <a
            href="https://github.com/Kamaiko"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub — Patrick Patenaude"
            className={socialIconCls}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
