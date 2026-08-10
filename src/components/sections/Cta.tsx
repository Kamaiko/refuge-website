"use client";

import { useRef, useState } from "react";
import { useEyebrowScrub } from "@/hooks/useEyebrowScrub";
import { SITE_CONFIG } from "@/lib/constants";
import { NAV } from "@/lib/data/nav";
import Marquee from "@/components/common/Marquee";
import NavWheelLink from "@/components/common/NavWheelLink";
import SocialIcons from "@/components/common/SocialIcons";

const MARQUEE_TEXT = "Réservez votre refuge";

/** Both inline links in the closing paragraph point here. */
const PROFILE_URL = "https://www.linkedin.com/in/patrickpatenaude";

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
  const introRef = useRef<HTMLHeadingElement>(null);

  // Same scrubbed fade-and-rise the Choisir / Activités eyebrows use. The
  // markup differs here (this one is the section's `<h2>`, not a `<p>`),
  // which is why the shared piece is a hook rather than a component.
  useEyebrowScrub(introRef, sectionRef);

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
      {/* Top-left intro copy. Acts as the section's semantic title.
          Scroll-fade scrubbed via the useGSAP above. Pre-hidden on
          mount with inline style to prevent SSR flash. */}
      <h2
        ref={introRef}
        style={{ opacity: 0 }}
        className="text-creme text-base md:text-lg font-semibold leading-snug max-w-md m-0"
      >
        Le moment est venu de ralentir.
        <br />
        Votre refuge vous attend.
      </h2>

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
          mobileSpeed={90}
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
            <ProfileLink>Patrick Patenaude</ProfileLink>. Si vous voulez un
            site sur-mesure pour votre marque,&nbsp;
            <ProfileLink>écrivez-moi</ProfileLink>.
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

        {/* Social icons — own row below the rail, `on-noir` tone for
            border contrast against the dark page bg. */}
        <div className="flex items-center gap-4">
          <SocialIcons tone="on-noir" />
        </div>
      </div>
    </section>
  );
}

/** Inline link to the author's profile. Both mentions in the closing
 *  paragraph point at the same URL and carried identical (copy-pasted)
 *  classes — and neither had any focus style, so keyboard users had no way
 *  to tell they were on them. `.focus-ring` is the shared class defined in
 *  globals.css.
 *
 *  Tone: `text-creme-dim` against the paragraph's warmer `creme-terre/70`,
 *  so the links read as the actionable element in the sentence. */
function ProfileLink({ children }: { children: React.ReactNode }) {
  return (
    <a
      href={PROFILE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-ring rounded-sm text-creme-dim underline underline-offset-4 hover:text-creme transition-colors duration-300"
    >
      {children}
    </a>
  );
}
