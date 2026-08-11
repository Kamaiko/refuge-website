"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { REFUGES } from "@/lib/data/refuges";
import { useReservePanel } from "@/components/common/ReservePanelContext";
import { SITE_CONFIG } from "@/lib/constants";
import { MQ } from "@/lib/breakpoints";
import { HEBERGEMENTS } from "@/lib/motion";
import Marquee from "@/components/common/Marquee";
import RevealChars from "@/components/common/RevealChars";

/**
 * Pinned scroll-scrub slideshow for the three refuges. The section pins for
 * ~6 viewports on desktop (3 on mobile) — within that range the cards
 * stack: card 0 grows from a stadium pill into a fullscreen rounded card,
 * then cards 1 and 2 slide up over it, scaling the stack down underneath.
 *
 * Reads `REFUGES` for content (order significant — see `lib/data/refuges.ts`).
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
export default function Hebergements() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardImageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const marqueeWrapRef = useRef<HTMLDivElement>(null);
  /** base-noir overlay faded in mid-timeline, replacing a backgroundColor tween. */
  const bgFadeRef = useRef<HTMLDivElement>(null);
  const loadingBarRef = useRef<HTMLDivElement>(null);
  const loadingBarFillRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  // Mirrors `activeIdx` for the scroll-tick guard — `onUpdate` fires every
  // frame during the pinned scrub, but React state reads inside the
  // callback would be stale. The ref reflects the latest committed value.
  const activeIdxRef = useRef(0);
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
          isDesktop: `(prefers-reduced-motion: no-preference) and ${MQ.mdUp}`,
          isMobile: `(prefers-reduced-motion: no-preference) and ${MQ.belowMd}`,
        },
        (ctx) => {
          const { isMobile } = ctx.conditions as { isDesktop: boolean; isMobile: boolean };
          const stickyDuration = isMobile
            ? HEBERGEMENTS.stickyDuration.mobile
            : HEBERGEMENTS.stickyDuration.desktop;

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
            1 - HEBERGEMENTS.scaleStep * 2,
            1 - HEBERGEMENTS.scaleStep,
            1,
          ] as const;
          // Progress at which each card's text reveals on the way down, and
          // re-hides on the way back up. The hide threshold sits ABOVE the
          // reveal one on purpose — the hysteresis keeps a jitter at the
          // boundary from flickering the text.
          const TEXT_IN = [0.20, 0.47, 0.74] as const;
          const TEXT_OUT = [0.25, 0.52, 0.95] as const;

          // Snap targets, derived from TEXT_OUT so the two can't drift apart.
          // The obvious derivation — "where each card finishes arriving",
          // i.e. `(PHASE_STARTS[i] + 1) / 5.5` — gives 0.18 / 0.45 / 0.73,
          // every one of which lands just BELOW its threshold. The reader
          // would settle on a card whose name and description had just been
          // animated away. Clearing TEXT_OUT keeps the text up in both scroll
          // directions.
          const SNAP_POINTS = [0, ...TEXT_OUT.map((t) => t + 0.02)];

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: stickyDuration,
              pin: true,
              scrub: 1,
              // Settle on the nearest refuge when the reader stops, instead of
              // leaving a card half-arrived. Deliberately NOT a wheel-hijack:
              // Pourquoi disables its own hijack below 768px because trapping
              // touch scroll is hostile, and two locked sections would make
              // the page read as a slideshow. `delay` waits out Lenis' inertia
              // so the snap doesn't fight momentum that's still unwinding.
              snap: {
                snapTo: SNAP_POINTS,
                duration: { min: 0.2, max: 0.5 },
                delay: 0.12,
                ease: "power2.out",
              },
              onUpdate: (self) => {
                const p = self.progress;
                const idx = p < 0.36 ? 0 : p < 0.64 ? 1 : 2;
                // Guard against same-value setState — onUpdate fires every
                // scroll frame during the pinned scrub. Without this, React
                // is notified on each tick even when the active card hasn't
                // changed (the bands cover ~30% of progress each).
                if (idx !== activeIdxRef.current) {
                  activeIdxRef.current = idx;
                  setActiveIdx(idx);
                }

                const dir = self.direction;
                setRevealActive((prev) => {
                  const next: boolean[] = [...prev] as boolean[];
                  if (dir === 1) {
                    if (p >= TEXT_IN[0] && !next[0]) next[0] = true;
                    if (p >= TEXT_IN[1] && !next[1]) next[1] = true;
                    if (p >= TEXT_IN[2] && !next[2]) next[2] = true;
                  } else {
                    if (p < TEXT_OUT[2] && next[2]) next[2] = false;
                    if (p < TEXT_OUT[1] && next[1]) next[1] = false;
                    if (p < TEXT_OUT[0] && next[0]) next[0] = false;
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
            .to(cards[0], { scale: STACK_FINAL_SCALES[1], duration: 1, ease: "none" }, PHASE_STARTS[1]);

          // Section background gris-tan → base-noir. Done by fading a
          // base-noir layer in rather than tweening the section's own
          // `backgroundColor`: colour is not a compositable property, so the
          // old version forced a full-viewport repaint on every scrub frame.
          // Opacity on a promoted layer is free by comparison, and the render
          // is identical.
          if (bgFadeRef.current) {
            tl.to(bgFadeRef.current, { opacity: 1, duration: 1, ease: "none" }, PHASE_STARTS[1]);
          }

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
      style={{ height: "100lvh" }}
    >
      {/* base-noir layer faded in by the timeline — see the comment on the
          tween. Sits behind everything (`-z-10` would escape the section's
          stacking context, so it's simply first in DOM at z-0). */}
      <div
        ref={bgFadeRef}
        aria-hidden
        className="absolute inset-0 bg-base-noir opacity-0 pointer-events-none will-change-[opacity]"
      />

      <div
        ref={marqueeWrapRef}
        aria-hidden
        className="absolute inset-0 flex items-center pointer-events-none select-none z-0"
      >
        <Marquee
          text={SITE_CONFIG.brandMark}
          speed={140}
          separator="·"
          // `max-md:text-[14vw]` — this band sits behind the card stack
          // rather than full-bleed, so it runs smaller on mobile.
          className="text-creme type-wordmark-band max-md:text-[14vw]"
        />
      </div>

      <div className="absolute inset-0 p-3 md:p-4 z-10">
        <div className="relative h-full w-full">
          {REFUGES.map((refuge, i) => (
            <div
              key={refuge.slug}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute inset-0 will-change-transform"
            >
              <article
                // Card 0's border-radius is GSAP-managed (stadium → 60px).
                className={`relative h-full w-full overflow-hidden bg-base-noir-soft ${
                  i === 0 ? "" : "rounded-frame md:rounded-hero"
                }`}
              >
                <div
                  ref={(el) => {
                    cardImageRefs.current[i] = el;
                  }}
                  className="absolute inset-0 will-change-transform"
                >
                  <Image
                    src={refuge.image}
                    alt={refuge.nom}
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

                <RefugeCardContent
                  refuge={refuge}
                  play={revealActive[i] ?? false}
                  onReserve={openReservePanel}
                />
              </article>
            </div>
          ))}
        </div>
      </div>

      {/* On mobile the bar sits ~120px from the bottom so it clears the
          floating Menu pill (bottom-12 + 60px height = 108px). On < 390px
          it's also centered horizontally with a 70vw width to avoid
          overflowing the viewport. From 390px up it returns to the
          original right-anchored layout, and at md+ moves back down to
          its original 8vh from bottom. */}
      <div
        ref={loadingBarRef}
        className="absolute z-40 pointer-events-none left-1/2 -translate-x-1/2 bottom-[120px] xs:left-auto xs:translate-x-0 xs:right-[8vw] md:bottom-[8vh]"
      >
        <div className="h-[3px] w-[70vw] xs:w-[80vw] max-w-[28rem] rounded-full bg-creme/15 overflow-hidden">
          <div
            ref={loadingBarFillRef}
            className="h-full w-full bg-creme rounded-full will-change-transform"
          />
        </div>
      </div>
    </section>
  );
}

function RefugeCardContent({
  refuge,
  play,
  onReserve,
}: {
  refuge: (typeof REFUGES)[number];
  play: boolean;
  onReserve: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const plusBtnWrapRef = useRef<HTMLSpanElement>(null);
  const capacityRef = useRef<HTMLDivElement>(null);

  // Initial state — set once before first paint so the elements start
  // hidden (matches the pre-migration CSS where opacity defaulted to 0
  // via the inline `style` driven by `play=false`).
  useGSAP(
    () => {
      gsap.set(descRef.current, { opacity: 0, x: 40 });
      gsap.set(plusBtnWrapRef.current, { scale: 0 });
      gsap.set(capacityRef.current, { opacity: 0, x: 40 });
    },
    { scope: cardRef },
  );

  // Reveal / hide driven by `play`. Re-runs on every flip during the
  // pinned scrub. Reveal cascades in a tight stagger: description first
  // (anchor of the eye), CTA row + "+" right after, capacity last —
  // ~80ms between each. Subtle but reads as intentional. The "+" uses
  // a punchier overshoot (back.out(2) vs the original 1.7) to give it
  // its own moment in the cascade. RevealChars (surnom + nom) is
  // unaffected — it has its own internal play handling.
  useGSAP(
    () => {
      if (play) {
        gsap.to(descRef.current, { opacity: 1, x: 0, duration: 0.9, delay: 0.1, ease: "power2.out" });
        gsap.to(plusBtnWrapRef.current, { scale: 1, duration: 0.95, delay: 0.22, ease: "elastic.out(0.7, 0.5)" });
        gsap.to(capacityRef.current, { opacity: 1, x: 0, duration: 0.9, delay: 0.26, ease: "power2.out" });
      } else {
        // Exit collapses simultaneously — staggering the hide reads as
        // sluggish. Match durations/eases to the entrance for symmetry.
        gsap.to(descRef.current, { opacity: 0, x: 40, duration: 0.9, ease: "power2.out" });
        gsap.to(plusBtnWrapRef.current, { scale: 0, duration: 0.6, ease: "power2.in" });
        gsap.to(capacityRef.current, { opacity: 0, x: 40, duration: 0.9, ease: "power2.out" });
      }
    },
    { scope: cardRef, dependencies: [play] },
  );

  return (
    <div ref={cardRef} className="relative z-10 flex h-full flex-col justify-end p-8 pb-36 md:p-14">
      <div className="max-w-3xl">
        <RevealChars
          text={refuge.surnom}
          play={play}
          duration={1.0}
          stagger={0.025}
          className="block text-creme-dim text-xs uppercase tracking-[0.3em] mb-4"
        />
      </div>
      {/* Title sits OUTSIDE max-w-3xl: at 8vw + tight tracking, the nom
          would otherwise wrap or be clipped by the card's overflow-hidden. */}
      <RevealChars
        as="h2"
        text={refuge.nom}
        play={play}
        delay={0.1}
        duration={1.1}
        className="block whitespace-nowrap pr-8 text-creme text-6xl md:text-8xl lg:text-[8vw] font-semibold leading-[0.9] tracking-[-0.02em] m-0"
      />
      <div className="max-w-3xl">
        <p
          ref={descRef}
          className="block text-creme-dim mt-6 max-w-xl text-sm leading-snug xs:text-lg xs:leading-relaxed md:text-xl will-change-transform"
        >
          {refuge.description}
        </p>

        <div className="mt-8 flex flex-nowrap items-center gap-4 md:gap-6">
          {/* Compact "+" CTA. tabIndex={-1}: Tab skips this flourish — the
              Header Réserver CTA is the keyboard path. Hover (Tailwind,
              independent of `play`): a cream disc grows from center
              over the gris-tan base, the "+" glyph rotates 135° (lands
              as ×), and the whole button scales 1 → 1.1.
              Wrapper carries the entrance scale so the button itself is
              free to drive the hover scale without inline transforms
              colliding (GSAP owns the wrapper's transform). */}
          <span ref={plusBtnWrapRef} className="inline-block">
            <button
              type="button"
              onClick={onReserve}
              tabIndex={-1}
              aria-label={`Réserver ${refuge.nom}`}
              className="group relative inline-flex h-12 w-12 xs:h-14 xs:w-14 items-center justify-center rounded-full overflow-hidden bg-creme-terre/70 transition-transform duration-300 ease-out hover:scale-[1.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-2 focus-visible:ring-offset-base-noir"
            >
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-creme scale-0 group-hover:scale-100 transition-transform duration-500 ease-out origin-center"
              />
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden
                className="relative z-10 text-base-noir/85 group-hover:rotate-[135deg] transition-transform duration-500 ease-out"
              >
                <path
                  d="M9 2v14M2 9h14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </span>
          <div
            ref={capacityRef}
            className="flex items-center gap-2 md:gap-6 text-creme-dim text-[11px] xs:text-xs whitespace-nowrap will-change-transform"
          >
            <span>{refuge.capacite}</span>
            <span className="opacity-40">·</span>
            <span>{refuge.surface}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
