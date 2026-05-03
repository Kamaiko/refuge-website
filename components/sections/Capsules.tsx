"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { UNITES } from "@/lib/data/unites";
import { useReservePanel } from "@/components/common/ReservePanelContext";
import { SITE_CONFIG } from "@/lib/constants";
import { CAPSULES } from "@/lib/motion";
import Marquee from "@/components/common/Marquee";
import RevealChars from "@/components/common/RevealChars";
import ArrowDiagonalIcon from "@/components/common/ArrowDiagonalIcon";

/**
 * Pinned scroll-scrub slideshow for the three refuges. The section pins for
 * ~6 viewports on desktop (3 on mobile) — within that range the cards
 * stack: card 0 grows from a stadium pill into a fullscreen rounded card,
 * then cards 1 and 2 slide up over it, scaling the stack down underneath.
 *
 * Reads `UNITES` for content (order significant — see `lib/data/unites.ts`).
 * Each card's text is revealed via {@link RevealChars}, driven imperatively
 * from the pinned timeline's `onUpdate` (not scroll-position-based, because
 * the cards are themselves moved by the timeline).
 *
 * The `Réserver {nom}` per-card buttons open the {@link ReservePanel} via
 * {@link useReservePanel}. They are intentionally `tabIndex={-1}` —
 * keyboard users reach the same flow via the global Header CTA, avoiding
 * having to scroll through the pinned section to focus duplicate buttons.
 *
 * Reduced-motion: skips the pin entirely, shows all cards at their final
 * stacked state.
 */
export default function Capsules() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardImageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const marqueeWrapRef = useRef<HTMLDivElement>(null);
  const loadingBarRef = useRef<HTMLDivElement>(null);
  const loadingBarFillRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [revealActive, setRevealActive] = useState<boolean[]>([false, false, false]);
  const { open: openReservePanel } = useReservePanel();

  useGSAP(
    () => {
      const section = sectionRef.current;
      const cards = cardRefs.current.filter((c): c is HTMLDivElement => !!c);
      if (!section || cards.length !== 3) return;

      const mm = gsap.matchMedia();

      // Mobile pin range is halved (3 viewports vs 6) — the full 6-viewport
      // scroll is exhausting on touch and the cards are still readable.
      mm.add(
        {
          isDesktop: "(prefers-reduced-motion: no-preference) and (min-width: 769px)",
          isMobile: "(prefers-reduced-motion: no-preference) and (max-width: 768px)",
        },
        (ctx) => {
          const { isMobile } = ctx.conditions as { isDesktop: boolean; isMobile: boolean };
          const stickyDuration = isMobile ? "+=300%" : CAPSULES.stickyDuration;

          gsap.set(cards[0], { scale: 0.42, yPercent: 0, opacity: 1, zIndex: 1 });
          gsap.set(cards[1], { yPercent: 110, scale: 1, opacity: 1, zIndex: 2 });
          gsap.set(cards[2], { yPercent: 110, scale: 1, opacity: 1, zIndex: 3 });

          // 540px = browser cap (50% of short side) on common 1080p viewports.
          const card0Article = cards[0].querySelector("article") as HTMLElement | null;
          if (card0Article) gsap.set(card0Article, { borderRadius: "540px" });

          cardImageRefs.current.forEach((img) => {
            if (img) gsap.set(img, { scale: 1.35 });
          });

          if (marqueeWrapRef.current) gsap.set(marqueeWrapRef.current, { opacity: 1 });
          if (loadingBarRef.current) gsap.set(loadingBarRef.current, { opacity: 0 });
          if (loadingBarFillRef.current) {
            gsap.set(loadingBarFillRef.current, { scaleX: 0, transformOrigin: "left center" });
          }
          // quickTo writes scaleX directly each frame — no React rerender on
          // every scroll tick and no integer rounding, so the bar tracks the
          // pinned scrub continuously.
          const fillSetter = loadingBarFillRef.current
            ? gsap.quickTo(loadingBarFillRef.current, "scaleX", { duration: 0.15, ease: "power2.out" })
            : null;

          // Timeline layout — total duration 5.5 units (no-op tween at pos 4
          // extends past phase 3 so card 3 gets a 1.5-unit sticky hold).
          const PHASE_STARTS = [0, 1.5, 3] as const;
          const STACK_FINAL_SCALES = [
            1 - CAPSULES.scaleStep * 2,
            1 - CAPSULES.scaleStep,
            1,
          ] as const;
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: stickyDuration,
              pin: true,
              scrub: 1,
              onUpdate: (self) => {
                const p = self.progress;
                const idx = p < 0.36 ? 0 : p < 0.64 ? 1 : 2;
                setActiveIdx(idx);

                const dir = self.direction;
                setRevealActive((prev) => {
                  const next: boolean[] = [...prev] as boolean[];
                  if (dir === 1) {
                    if (p >= 0.20 && !next[0]) next[0] = true;
                    if (p >= 0.47 && !next[1]) next[1] = true;
                    if (p >= 0.74 && !next[2]) next[2] = true;
                  } else {
                    if (p < 0.95 && next[2]) next[2] = false;
                    if (p < 0.52 && next[1]) next[1] = false;
                    if (p < 0.25 && next[0]) next[0] = false;
                  }
                  if (next[0] === prev[0] && next[1] === prev[1] && next[2] === prev[2]) return prev;
                  return next;
                });

                fillSetter?.(p);
              },
            },
          });

          cardImageRefs.current.forEach((img, i) => {
            if (img) tl.to(img, { scale: 1, duration: 1, ease: "none" }, PHASE_STARTS[i]);
          });

          tl.to(cards[0], { scale: 1, duration: 1, ease: "none" }, PHASE_STARTS[0]);
          if (card0Article) {
            tl.to(card0Article, { borderRadius: "60px", duration: 1, ease: "power1.out" }, PHASE_STARTS[0]);
          }
          if (marqueeWrapRef.current) {
            // power2.out front-loads the fade so the wordmark dims BEFORE the
            // growing card masks it. Linear hid the change behind the card.
            tl.to(marqueeWrapRef.current, { opacity: 0, duration: 1, ease: "power2.out" }, PHASE_STARTS[0]);
          }

          tl.to(cards[1], { yPercent: 0, duration: 1, ease: "none" }, PHASE_STARTS[1])
            .to(cards[0], { scale: STACK_FINAL_SCALES[1], duration: 1, ease: "none" }, PHASE_STARTS[1])
            .to(section, { backgroundColor: "var(--color-base-noir)", duration: 1, ease: "none" }, PHASE_STARTS[1]);

          tl.to(cards[2], { yPercent: 0, duration: 1, ease: "none" }, PHASE_STARTS[2])
            .to(cards[1], { scale: STACK_FINAL_SCALES[1], duration: 1, ease: "none" }, PHASE_STARTS[2])
            .to(cards[0], { scale: STACK_FINAL_SCALES[0], duration: 1, ease: "none" }, PHASE_STARTS[2]);

          tl.to({}, { duration: 1.5 }, 4);
        },
      );

      // Reduced-motion: skip the pinned scrub entirely. Show the three cards
      // stacked at their final state so the content is still reachable.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        cards.forEach((card) => gsap.set(card, { scale: 1, yPercent: 0, opacity: 1 }));
        cardImageRefs.current.forEach((img) => {
          if (img) gsap.set(img, { scale: 1 });
        });
        setRevealActive([true, true, true]);
      });

      return () => {
        mm.revert();
        ScrollTrigger.getAll().forEach((t) => {
          if (t.trigger === section) t.kill();
        });
      };
    },
    { scope: sectionRef },
  );

  // Loading bar fades in synced with the first card's text reveal, stays.
  useGSAP(
    () => {
      if (!loadingBarRef.current) return;
      gsap.to(loadingBarRef.current, {
        opacity: revealActive[0] || revealActive[1] || revealActive[2] || activeIdx > 0 ? 1 : 0,
        duration: 0.5,
        ease: "expo.out",
        overwrite: true,
      });
    },
    { dependencies: [revealActive, activeIdx] },
  );

  return (
    <section
      ref={sectionRef}
      id="refuges"
      className="relative w-full bg-gris-tan overflow-hidden"
      style={{ height: "100svh" }}
    >
      <div
        ref={marqueeWrapRef}
        aria-hidden
        className="absolute inset-0 flex items-center pointer-events-none select-none z-0"
      >
        <Marquee
          text={SITE_CONFIG.brandMark}
          speed={140}
          separator="·"
          className="text-creme text-[14vw] md:text-[12vw] font-semibold leading-none tracking-[-0.04em]"
        />
      </div>

      <div className="absolute inset-0 p-3 md:p-4 z-10">
        <div className="relative h-full w-full">
          {UNITES.map((unite, i) => (
            <div
              key={unite.slug}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute inset-0 will-change-transform"
            >
              <article
                // Card 0's border-radius is GSAP-managed (stadium → 60px).
                className={`relative h-full w-full overflow-hidden bg-base-noir-soft ${
                  i === 0 ? "" : "rounded-[40px] md:rounded-[60px]"
                }`}
              >
                <div
                  ref={(el) => {
                    cardImageRefs.current[i] = el;
                  }}
                  className="absolute inset-0 will-change-transform"
                >
                  <Image
                    src={unite.image}
                    alt={unite.nom}
                    fill
                    sizes="100vw"
                    priority={i === 0}
                    // Source AVIFs (2400×1340, ~150KB) are already optimized;
                    // Next's default re-encode at quality 75 would visibly
                    // soften them. Same bandwidth either way.
                    unoptimized
                    className="object-cover"
                  />
                </div>

                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse 90% 65% at 0% 100%, rgba(24,23,23,0.92) 0%, rgba(24,23,23,0.5) 38%, rgba(24,23,23,0) 80%)",
                  }}
                />

                <UniteCardContent
                  unite={unite}
                  play={revealActive[i] ?? false}
                  onReserve={openReservePanel}
                />
              </article>
            </div>
          ))}
        </div>
      </div>

      <div
        ref={loadingBarRef}
        className="absolute z-40 pointer-events-none"
        style={{ bottom: "8vh", right: "8vw" }}
      >
        <div className="h-[3px] w-[28rem] rounded-full bg-creme/15 overflow-hidden">
          <div
            ref={loadingBarFillRef}
            className="h-full w-full bg-creme rounded-full will-change-transform"
          />
        </div>
      </div>
    </section>
  );
}

function UniteCardContent({
  unite,
  play,
  onReserve,
}: {
  unite: (typeof UNITES)[number];
  play: boolean;
  onReserve: () => void;
}) {
  return (
    <div className="relative z-10 flex h-full flex-col justify-end p-8 md:p-14">
      <div className="max-w-3xl">
        <RevealChars
          text={unite.surnom}
          play={play}
          duration={0.7}
          className="block text-creme-dim text-xs uppercase tracking-[0.3em] mb-4"
        />
      </div>
      {/* Title sits OUTSIDE max-w-3xl: at 8vw + tight tracking, the nom
          would otherwise wrap or be clipped by the card's overflow-hidden. */}
      <RevealChars
        text={unite.nom}
        play={play}
        delay={0.1}
        duration={1.1}
        className="block whitespace-nowrap pr-8 text-creme text-6xl md:text-8xl lg:text-[8vw] font-semibold leading-[0.9] tracking-[-0.04em]"
      />
      <div className="max-w-3xl">
        <p
          className="block text-creme-dim mt-6 max-w-xl text-lg md:text-xl leading-relaxed transition-[opacity,transform] duration-[900ms] ease-out will-change-transform"
          style={{
            opacity: play ? 1 : 0,
            transform: play ? "translateX(0)" : "translateX(40px)",
            transitionDelay: play ? "0.1s" : "0s",
          }}
        >
          {unite.description}
        </p>

        <div
          className="mt-8 flex flex-wrap items-center gap-6 transition-opacity duration-700 ease-out"
          style={{
            opacity: play ? 1 : 0,
            transitionDelay: play ? "0.6s" : "0s",
          }}
        >
          {/* tabIndex={-1}: visual flourish CTAs are skipped by Tab. The
              same reservation flow is reachable via the Header "Réserver"
              CTA, which opens the panel with refuge selection. Avoids
              keyboard users having to scroll through the pinned scrub
              just to focus a duplicate button. Mouse + AT activation work. */}
          <button
            type="button"
            onClick={onReserve}
            tabIndex={-1}
            className="inline-flex items-center gap-3 rounded-pill bg-creme px-6 py-3 text-sm font-medium text-base-noir transition-opacity hover:opacity-90"
          >
            Réserver {unite.nom}
            <ArrowDiagonalIcon />
          </button>
          <div className="flex items-center gap-6 text-creme-dim text-xs">
            <span>{unite.capacite}</span>
            <span className="opacity-40">·</span>
            <span>{unite.surface}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
