"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "@/lib/gsap";
import { SITE_CONFIG } from "@/lib/constants";
import RevealChars from "@/components/common/RevealChars";

/**
 * Closing footer. Tan delimiter line, single-row credit + copyright,
 * then a massive {@link RevealChars} wordmark that animates its glyphs
 * in/out as the section's top edge enters / exits the viewport.
 *
 * The wordmark fills with a vertical `creme-dim/45 → creme` gradient
 * applied INLINE on the RevealChars root span (via the `style` prop).
 * Tailwind v4's `bg-clip-text` + `text-transparent` utility combo
 * didn't reliably paint the gradient through the deeply nested
 * transformed children of RevealChars — inline style guarantees the
 * background image + clip + transparent fill resolve in every engine.
 *
 * Two ScrollTriggers : the entry trigger fires at `top 85%` (the
 * moment the footer's top edge crosses 85% from viewport top going
 * down — footer just appearing from below). The exit trigger fires
 * its `onLeaveBack` at `top 30%`, so when the user scrolls UP the
 * reverse animation plays while the footer is still mostly visible
 * (instead of waiting until the footer has nearly disappeared at the
 * bottom of the viewport). Its `onEnter` re-asserts play=true to
 * handle the bounce-back case where the user scrolled up past the
 * exit, then scrolls back down without going above the entry start.
 *
 * Sits inside a parent that owns the `base-noir → gris-tan` background
 * gradient spanning the CTA's lower half + this entire footer (see
 * `app/page.tsx`), so this section's bg stays transparent.
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
      // Exit position must lie at a `top X%` the footer's top can
      // actually reach. The footer is at the very bottom of the page,
      // so at page bottom its top sits at roughly `(1 - footerHeight/
      // viewportHeight) * 100%` — typically ~40-50%. The previous
      // "top 30%" was unreachable (footer top never goes below that
      // baseline) and the trigger never fired its onLeaveBack. "top
      // 60%" gives a small but reachable scroll-up distance from the
      // bottom (~10-15% of viewport upward) for the reverse to fire.
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
      className="relative w-full px-8 md:px-12 pt-10 md:pt-14 pb-4 md:pb-6"
    >
      {/* Tan delimiter — `creme-terre/70` matches the brand's secondary
          text tone used in Choisir, Carousel subtitles, and Cta's
          concept paragraph. */}
      <div aria-hidden className="h-px w-full bg-creme-terre/70" />

      {/* Top info row : author credit on the left, copyright on the
          right. Stacks vertically on tiny mobile so the long French
          credit string isn't truncated. */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mt-6 mb-12 md:mb-20 text-creme-dim text-sm md:text-base font-medium">
        <span>Site web fait par&nbsp;—&nbsp;Patrick Patenaude</span>
        <span>Tous droits réservés © 2026</span>
      </div>

      {/* Big wordmark. "Aquilon" + a separate, smaller ® span tucked
          to the bottom-right. Splitting them lets the ® keep its own
          font-size and vertical-align without participating in the
          per-glyph RevealChars animation (which would scale it up to
          match the main letters). Both elements use the same
          `aquilon-wordmark-fill` class, so the gradient is consistent
          across the whole word.
          - `inline-block` + `text-center` on the wrapper centers the
            two pieces as one horizontal unit.
          - `align-bottom` on both keeps their bottom edges aligned to
            the line-box bottom — visually the ® sits at the lower-
            right corner of "Aquilon".
          - `tracking-[0.01em]` adds the tiny letter-spacing the user
            asked for, replacing the earlier tight `-0.04em` kerning.
          - `stagger: 0` + `delay: 0.1` plays all glyphs in unison
            after a tiny pause.

          Gradient + clip-text applied PER-GLYPH via the
          `aquilon-wordmark-fill` CSS class on each RevealChars mask
          span (charClassName). Applying it on the outer span (whether
          via Tailwind utilities OR inline style) never painted —
          background-clip: text doesn't reach through deeply nested
          transformed descendants reliably. Per-glyph clip works on a
          simple leaf-like element and is identical visually since
          every glyph shares the same line-height. */}
      <div className="overflow-hidden text-center">
        <RevealChars
          text={SITE_CONFIG.name}
          play={play}
          stagger={0}
          delay={0.1}
          duration={1.0}
          className="inline-block align-bottom leading-[0.85] tracking-[0.01em] text-[22vw] font-bold"
          charClassName="aquilon-wordmark-fill"
        />
        <span
          aria-hidden
          className="aquilon-wordmark-fill inline-block align-bottom text-[6vw] font-bold leading-[0.85] ml-[0.05em]"
        >
          ®
        </span>
      </div>
    </footer>
  );
}
