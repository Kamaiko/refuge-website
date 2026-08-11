"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "@/lib/gsap";
import AquilonReveal from "@/components/common/AquilonReveal";

/**
 * Closing footer. Tan delimiter line, single-row credit + copyright, then a
 * massive {@link AquilonReveal} wordmark that animates its glyphs in and
 * out as the section enters / leaves the viewport.
 *
 * The wordmark fills with a tan → creme vertical gradient applied per-glyph
 * via the `.aquilon-wordmark-fill` CSS class on each glyph mask (see
 * `app/globals.css`). Applying the gradient on the outer span doesn't reach
 * the transformed descendants reliably in Tailwind v4; per-glyph
 * application sidesteps that.
 *
 * One ScrollTrigger at `top 80%`: `onEnter` plays the reveal, `onLeaveBack`
 * plays the reverse-out on scroll-up. (This was previously two separate
 * triggers, documented as firing at different thresholds — but both were
 * created with the same `start`, so the described entry/exit hysteresis
 * never actually existed. Merged into one.)
 *
 * Sits inside the `relative isolate` wrapper in `src/app/page.tsx` that owns
 * the `base-noir → gris-tan` background gradient spanning the CTA's lower
 * half plus this entire footer — so this section's own bg stays transparent.
 */
export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null);
  const [play, setPlay] = useState(false);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 80%",
        onEnter: () => setPlay(true),
        onLeaveBack: () => setPlay(false),
      });
      return () => trigger.kill();
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
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mt-16 md:mt-24 mb-12 md:mb-20 text-creme-dim text-sm md:text-2xl font-medium">
        <span>Site web fait par Patrick Patenaude</span>
        <span>Tous droits réservés © 2026</span>
      </div>

      {/* Big wordmark. Wrapper's `h-[1em]` (resolves against the
          `text-[24vw]` font-size on the same element) crops the
          line-box at the descender bottom so there's no leading-bottom
          gap below the wordmark. The `aquilon-footer-wordmark` marker
          class scopes the `:last-child` shrink rule in globals.css so
          the ® reads as a superscript here without affecting other
          components. */}
      <div className="aquilon-footer-wordmark overflow-hidden text-center h-[1em] text-[24vw]">
        <AquilonReveal
          play={play}
          className="block leading-[1.0] tracking-[0.01em] font-bold"
          charClassName="aquilon-wordmark-fill"
          ease="power2.inOut"
          duration={1.0}
        />
      </div>
    </footer>
  );
}
