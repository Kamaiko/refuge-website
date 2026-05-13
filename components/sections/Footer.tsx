"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "@/lib/gsap";
import AquilonReveal from "@/components/common/AquilonReveal";

/**
 * Closing footer. Tan delimiter line, single-row credit + copyright,
 * then a massive {@link RevealChars} wordmark that animates its glyphs
 * in/out as the section enters / exits the viewport.
 *
 * The wordmark fills with a tan → creme vertical gradient applied
 * per-glyph via the `.aquilon-wordmark-fill` CSS class on each
 * RevealChars mask (see `app/globals.css`). Applying the gradient on
 * the outer span doesn't reach RevealChars' transformed descendants
 * reliably in Tailwind v4; per-glyph application sidesteps that.
 *
 * Two ScrollTriggers : entry at `top 85%` plays the slide-in; exit
 * at `top 60%` plays the reverse-out on scroll-up. The exit also
 * listens to `onEnter` to re-trigger play=true if the user bounces
 * back down without crossing the entry threshold above.
 *
 * Sits inside the `relative isolate` wrapper in `app/page.tsx` that
 * owns the `base-noir → gris-tan` background gradient spanning the
 * CTA's lower half + this entire footer — so this section's own bg
 * stays transparent.
 */
export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null);
  const [play, setPlay] = useState(false);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const entryTrigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 85%",
        onEnter: () => setPlay(true),
      });
      // Exit `start` must be reachable by the footer's top edge. At
      // page bottom the footer's top sits at ~(1 - footerH/viewportH)
      // * 100%, so the threshold has to be larger than that — `top
      // 60%` is reachable within ~10-15% of upward scroll.
      const exitTrigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 60%",
        onLeaveBack: () => setPlay(false),
        onEnter: () => setPlay(true),
      });
      return () => {
        entryTrigger.kill();
        exitTrigger.kill();
      };
    },
    { scope: sectionRef },
  );

  return (
    <footer
      ref={sectionRef}
      className="relative w-full px-8 md:px-12 pt-10 md:pt-14 pb-0"
    >
      {/* Tan delimiter — `creme-terre/70` matches the brand's secondary
          text tone used in Choisir, Carousel subtitles, and Cta's
          concept paragraph. */}
      <div aria-hidden className="h-px w-full bg-creme-terre/70" />

      {/* Top info row : author credit on the left, copyright on the
          right. Stacks vertically on tiny mobile so the long French
          credit string isn't truncated. */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mt-10 md:mt-14 mb-12 md:mb-20 text-creme-dim text-base md:text-lg font-medium">
        <span>Site web fait par&nbsp;—&nbsp;Patrick Patenaude</span>
        <span>Tous droits réservés © 2026</span>
      </div>

      {/* Big wordmark. Wrapper's `h-[1em]` (resolves against the
          `text-[24vw]` font-size on the same element) crops the
          line-box at the descender bottom so there's no leading-bottom
          gap below the wordmark. The `aquilon-footer-wordmark` marker
          class scopes the `:last-child` shrink rule in globals.css to
          this instance only, so the ® reads as a superscript here
          without affecting Hebergements titles that reuse the same
          gradient via `aquilon-wordmark-fill`. */}
      <div className="aquilon-footer-wordmark overflow-hidden text-center h-[1em] text-[24vw]">
        <AquilonReveal
          play={play}
          mode="wipe-and-slide"
          className="block leading-[1.0] tracking-[0.01em] font-bold"
          charClassName="aquilon-wordmark-fill"
          ease="power2.inOut"
          duration={1.0}
        />
      </div>
    </footer>
  );
}
