"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { MQ } from "@/lib/breakpoints";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { SITE_CONFIG } from "@/lib/constants";
import { POURQUOI } from "@/lib/motion";
import { dispatchSectionLock } from "@/lib/section-lock";
import SlideIndicators from "@/components/common/SlideIndicators";
import {
  SLIDES,
  LABELS,
  LAST_INDEX,
  SLIDE_IMAGE_ZOOM,
  TEXT_SWAP_DELAY_MS,
} from "./pourquoi/slides";
import {
  CardSlot,
  CardWrapper,
  RoundedFrame,
  SlideImage,
  CardText,
} from "./pourquoi/cards";


/**
 * Three-slide horizontal carousel with **wheel-hijacked**, fixed-speed
 * transitions. Pinned via ScrollTrigger; while the pin is active, a
 * window-level wheel listener (capture phase) calls `preventDefault` +
 * `stopImmediatePropagation`, converts each tick into at most one
 * `tl.tweenTo(LABELS[N])` call, and stops Lenis (via section-lock event
 * to SmoothScroll) so a fast scroll burst can't carry the user past
 * the section before our handler engages.
 *
 * Layout:
 * - Slide 1: text-card LEFT, image RIGHT
 * - Slide 2: image LEFT (came from RIGHT during 1→2 with curtain swap),
 *            text-card RIGHT (rose from below)
 * - Slide 3: text-card LEFT (came from RIGHT during 2→3 with sequential
 *            text-out → text-in via RevealChars), image RIGHT (rose).
 *
 * Effects during 1→2: (a) curtain wipes top→bottom over the image card
 * (clip-path on layer 1 reveals layer 2 underneath), (b) dolly — layer 1
 * scales up 1.25 (zoom in as it leaves), layer 2 scales from 1.25 → 1
 * (zoom out as it arrives). Effects during 2→3: text content swaps
 * sequentially inside the travelling card; image fades + scales down.
 *
 * `position: relative; z-10` lets MarqueeBrand's parallaxed text slide
 * UNDER this section's painted area as the user scrolls into it.
 *
 * Reduced-motion: skips the pin and wheel-hijack entirely AND renders the
 * stacked layout (the one written for mobile) at every width, so all three
 * slides stay reachable. Showing only slide 1 — as this did previously —
 * silently dropped two thirds of the section's content.
 */
export default function Pourquoi() {
  const sectionRef = useRef<HTMLElement>(null);

  const textCardARef = useRef<HTMLDivElement>(null);
  const imageCardARef = useRef<HTMLDivElement>(null);
  const imageLayer1Ref = useRef<HTMLDivElement>(null);
  // Dolly targets — scale only the inner image so the rounded card mask
  // stays the same visible size during the zoom.
  const imageScale1Ref = useRef<HTMLDivElement>(null);
  const imageScale2Ref = useRef<HTMLDivElement>(null);
  const textCardBRef = useRef<HTMLDivElement>(null);
  const imageCardBRef = useRef<HTMLDivElement>(null);

  // Two booleans (instead of one `showText3`) so the slide 2→3 swap can
  // run sequentially: text-2 fades out, then after `textSwapDelayMs`
  // text-3 fades in. During the delay, BOTH are false — a single-flag
  // version would crossfade the two simultaneously instead.
  const [text2Active, setText2Active] = useState(true);
  const [text3Active, setText3Active] = useState(false);

  // Layout switch, not an animation parameter. The desktop slides are
  // absolutely stacked and only ever separated by the wheel-hijack
  // timeline; with reduced motion that timeline never runs, so slides 2
  // and 3 would sit permanently under slide 1 with no way to reach them.
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      // Initial state — applied on every viewport so slide 1 is the
      // visible default even when the desktop wheel handler is inactive
      // (mobile, reduced-motion).
      gsap.set(imageLayer1Ref.current, { clipPath: "inset(0% 0 0 0)" });
      gsap.set(imageScale2Ref.current, { scale: 1.25, transformOrigin: "center" });
      gsap.set(imageScale1Ref.current, { scale: 1, transformOrigin: "center" });
      gsap.set(textCardBRef.current, { yPercent: 110 });
      gsap.set(imageCardBRef.current, { yPercent: 110 });

      // Paused timeline with labels — one slide of stable rest at each
      // label, transitions are 1 unit long each. `power1.inOut` is the
      // only ease family that's mirror-symmetric (forward and backward
      // play feel identical); set as a default so each tween below
      // doesn't repeat it. Linear is also symmetric but feels mechanical;
      // `power1.out` has more punch but is asymmetric (its fast-start
      // becomes a fast-end when reversed).
      const tl = gsap.timeline({ paused: true, defaults: { ease: POURQUOI.ease } });
      tl.addLabel(LABELS[0], 0);

      // ─── Phase 1: slide 0 → slide 1 ────────────────────────────────
      tl.to(imageCardARef.current, {
        xPercent: -100,
        x: POURQUOI.travelGapPx,
        duration: 1,
      }, LABELS[0]);
      tl.to(imageLayer1Ref.current, {
        clipPath: "inset(100% 0 0 0)",
        duration: 0.95,
        // Curtain stays linear — its head moves at constant speed for an
        // even, mechanical descent rather than power's accelerating-then-
        // settling curve.
        ease: "none",
      }, LABELS[0]);
      // Dolly: layer 1 zooms IN to 1.25 as it leaves; layer 2 zooms OUT
      // from 1.25 to 1 as it arrives. 25% scale is large enough to read
      // clearly at viewing distance.
      tl.to(imageScale1Ref.current, { scale: 1.25, duration: 1 }, LABELS[0]);
      tl.to(imageScale2Ref.current, { scale: 1, duration: 1 }, LABELS[0]);
      tl.to(textCardARef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.85,
      }, LABELS[0]);
      tl.to(textCardBRef.current, { yPercent: 0, duration: 1 }, LABELS[0]);
      tl.addLabel(LABELS[1], `${LABELS[0]}+=1`);

      // textCardB needs to cover imageCardA when it travels left in phase 2.
      // Started at z-15 (behind imageCardA) so it could rise BEHIND the
      // travelling image during phase 1; flip the stack at slide 1.
      tl.set(textCardBRef.current, { zIndex: 30 }, LABELS[1]);

      // ─── Phase 2: slide 1 → slide 2 ────────────────────────────────
      tl.to(textCardBRef.current, {
        xPercent: -100,
        x: POURQUOI.travelGapPx,
        duration: 1,
      }, LABELS[1]);
      tl.to(imageCardARef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.85,
      }, LABELS[1]);
      tl.to(imageCardBRef.current, { yPercent: 0, duration: 1 }, LABELS[1]);
      tl.addLabel(LABELS[2], `${LABELS[1]}+=1`);

      const mm = gsap.matchMedia();

      // Desktop + motion-OK only: pin + wheel hijack. matchMedia auto-
      // cleans up the pin and the wheel listener if the user resizes
      // across the boundary or toggles their reduced-motion preference.
      mm.add(`(prefers-reduced-motion: no-preference) and ${MQ.mdUp}`, () => {
        const trigger = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "+=200",
          pin: true,
          // Stop / start Lenis on pin enter / leave so a fast scroll
          // burst can't tween its way past us before our wheel handler
          // can engage. SmoothScroll listens for the section-lock event.
          onEnter: () => dispatchSectionLock(true),
          onLeave: () => dispatchSectionLock(false),
          onEnterBack: () => dispatchSectionLock(true),
          onLeaveBack: () => dispatchSectionLock(false),
        });

        const state = { currentSlide: 0, isAnimating: false };
        let canFire = true;
        let isReleasing = false;
        let textSwapTimer: number | null = null;
        let cooldownTimer: number | null = null;
        let releasingTimer: number | null = null;

        const clearTextSwap = () => {
          if (textSwapTimer !== null) {
            window.clearTimeout(textSwapTimer);
            textSwapTimer = null;
          }
        };

        const queueTextSwap = (
          out: (v: boolean) => void,
          inn: (v: boolean) => void,
        ) => {
          // Drop any pending swap from a previous transition — quick
          // back-to-back input must not let stale timers fire.
          clearTextSwap();
          out(false);
          textSwapTimer = window.setTimeout(() => {
            inn(true);
            textSwapTimer = null;
          }, TEXT_SWAP_DELAY_MS);
        };

        const tweenTo = (target: number) => {
          if (state.isAnimating || state.currentSlide === target) return;
          const fromCurrent = state.currentSlide;
          state.isAnimating = true;
          canFire = false;

          // Text swap is needed only on the slide 1 ↔ 2 boundary —
          // textCardB carries text-2 by default; the swap to text-3
          // happens during the 1→2 travel. Going forward 0→1 (rising
          // the card) keeps text-2 visible; going back 1→0 (descending)
          // also leaves text-2 visible. Going back 2→1 reverts the swap.
          if (target === 2 && fromCurrent === 1) {
            queueTextSwap(setText2Active, setText3Active);
          } else if (target === 1 && fromCurrent === 2) {
            queueTextSwap(setText3Active, setText2Active);
          }

          tl.tweenTo(LABELS[target], {
            duration: POURQUOI.transitionDuration,
            ease: POURQUOI.ease,
            onComplete: () => {
              state.currentSlide = target;
              state.isAnimating = false;
              cooldownTimer = window.setTimeout(() => {
                canFire = true;
                cooldownTimer = null;
              }, POURQUOI.cooldownMs);
            },
          });
        };

        /** Release the pin via a native smooth-scroll past one of its
         *  boundaries. While the smooth-scroll runs, `isReleasing` is
         *  set so subsequent wheel ticks short-circuit — otherwise
         *  `trigger.isActive` may still report `true` for a few frames
         *  and the same `scrollTo` would queue redundantly, fighting
         *  Lenis (which is also still locked on the trailing frames). */
        const releasePin = (toY: number) => {
          if (isReleasing) return;
          isReleasing = true;
          window.scrollTo({ top: toY, behavior: "smooth" });
          if (releasingTimer !== null) window.clearTimeout(releasingTimer);
          releasingTimer = window.setTimeout(() => {
            isReleasing = false;
            releasingTimer = null;
          }, 600);
        };

        const handleWheel = (e: WheelEvent) => {
          if (!trigger.isActive) return;

          // While a release smooth-scroll is in flight, swallow ticks so
          // we don't re-fire the same release or fight the native scroll.
          if (isReleasing) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return;
          }

          const dir = e.deltaY > 0 ? "forward" : "backward";

          // Edge: last slide + forward → release pin forward.
          if (
            dir === "forward" &&
            state.currentSlide === LAST_INDEX &&
            !state.isAnimating
          ) {
            e.preventDefault();
            e.stopImmediatePropagation();
            releasePin(trigger.end + 50);
            return;
          }
          // Edge: first slide + backward → release pin backward.
          if (
            dir === "backward" &&
            state.currentSlide === 0 &&
            !state.isAnimating
          ) {
            e.preventDefault();
            e.stopImmediatePropagation();
            releasePin(trigger.start - 50);
            return;
          }

          // In zone: hard-lock scroll. preventDefault stops native scroll;
          // stopImmediatePropagation prevents Lenis (bubbling-phase wheel
          // listener) from accumulating virtual scroll while we're in
          // control.
          e.preventDefault();
          e.stopImmediatePropagation();

          if (state.isAnimating || !canFire) return;

          tweenTo(state.currentSlide + (dir === "forward" ? 1 : -1));
        };

        // capture: true so our handler fires before any bubbling-phase
        // listeners (notably Lenis's). passive: false so preventDefault
        // is honoured.
        window.addEventListener("wheel", handleWheel, {
          passive: false,
          capture: true,
        });

        return () => {
          trigger.kill();
          window.removeEventListener("wheel", handleWheel, true);
          clearTextSwap();
          if (cooldownTimer !== null) window.clearTimeout(cooldownTimer);
          if (releasingTimer !== null) window.clearTimeout(releasingTimer);
          // Safety: release the lock if matchMedia tears this branch down
          // mid-engagement (e.g. resize across the md boundary, or the
          // user toggled their reduced-motion preference).
          dispatchSectionLock(false);
        };
      });

      // Reduced-motion (any width): no pin, no listeners. The desktop
      // card stack isn't rendered at all in that case (see
      // `prefersReducedMotion` in the JSX) — the stacked layout takes
      // over and every slide stays reachable by plain scrolling.

      return () => {
        mm.revert();
        tl.kill();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="pourquoi"
      aria-labelledby="pourquoi-heading"
      className={`relative w-full overflow-hidden bg-base-noir z-10 ${
        prefersReducedMotion ? "" : "md:h-screen"
      }`}
    >
      {/* The visible "Pourquoi Aquilon ?" title is the MarqueeBrand band
          above, which is aria-hidden (it's a decorative scrolling wordmark).
          So this section had no heading of any kind. */}
      <h2 id="pourquoi-heading" className="sr-only">
        Pourquoi {SITE_CONFIG.brandMark} ?
      </h2>

      {/* Mobile: vertical stack — small gris-tan text card on top,
          larger image card below. The wheel-hijack carousel doesn't fit
          a 50/50 column layout below 768px, so we drop it entirely on
          mobile and let the user scroll through the three slides
          naturally. */}
      <div
        className={`${
          prefersReducedMotion ? "flex" : "md:hidden flex"
        } flex-col gap-8 px-3 py-16`}
      >
        {SLIDES.map((slide, i) => (
          // One unified grey card per slide. The image sits INSIDE the card
          // with all four corners rounded — a small `p-3` outer padding (12px)
          // gives it room without being flush, while the inner text gets
          // extra `px-4 pt-4` to keep its breathing space at the original
          // ~28px from the card edge. Wider image than the prior `p-7`-only
          // inset, but still visibly contained.
          <article key={slide.title} className="bg-gris-tan rounded-card p-3 flex flex-col gap-3">
            <div className="px-4 pt-4 flex flex-col gap-6">
              <h3 className="text-creme-terre/85 text-3xl xs:text-4xl font-medium leading-[1.1] tracking-tight">
                {slide.title}
              </h3>
              <div className="flex items-end justify-between gap-4">
                <SlideIndicators current={i + 1} total={SLIDES.length} active />
                <p className="text-creme-dim text-base leading-relaxed max-w-sm text-right">
                  {slide.body}
                </p>
              </div>
            </div>
            <div className="relative aspect-[16/10] w-full rounded-[20px] overflow-hidden">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                sizes="100vw"
                unoptimized
                className="object-cover"
                style={{ transform: `scale(${SLIDE_IMAGE_ZOOM})` }}
              />
            </div>
          </article>
        ))}
      </div>

      {/* Desktop: absolutely-positioned wheel-hijack carousel. Hidden on
          mobile. The cards are `position: absolute` to the section
          (closest positioned ancestor); the wrapper here is just a
          display gate, not a containing block. */}
      <div className={prefersReducedMotion ? "hidden" : "hidden md:block"}>
        <CardSlot ref={textCardARef} side="left" zClass="z-10">
          <CardWrapper>
            <CardText
              title={SLIDES[0].title}
              body={SLIDES[0].body}
              active
              index={1}
              total={SLIDES.length}
            />
          </CardWrapper>
        </CardSlot>

        <CardSlot ref={textCardBRef} side="right" zClass="z-[15]">
          <CardWrapper>
            <CardText
              title={SLIDES[1].title}
              body={SLIDES[1].body}
              active={text2Active}
              index={2}
              total={SLIDES.length}
            />
            <CardText
              title={SLIDES[2].title}
              body={SLIDES[2].body}
              active={text3Active}
              index={3}
              total={SLIDES.length}
              stacked
            />
          </CardWrapper>
        </CardSlot>

        <CardSlot ref={imageCardARef} side="right" zClass="z-20">
          <RoundedFrame>
            {/* Image 2 layer (behind) — dolly target imageScale2Ref.
                alt stays empty because the foreground image (Image 1)
                announces the active slide; layered images are visual
                continuity, not standalone content. */}
            <div ref={imageScale2Ref} className="absolute inset-0">
              <SlideImage src={SLIDES[1].image} />
            </div>
            {/* Image 1 layer (top) — clip-path target + dolly target. */}
            <div ref={imageLayer1Ref} className="absolute inset-0">
              <div ref={imageScale1Ref} className="absolute inset-0">
                <SlideImage src={SLIDES[0].image} alt={SLIDES[0].title} />
              </div>
            </div>
          </RoundedFrame>
        </CardSlot>

        <CardSlot ref={imageCardBRef} side="right" zClass="z-[25]">
          <RoundedFrame>
            <SlideImage src={SLIDES[2].image} alt={SLIDES[2].title} />
          </RoundedFrame>
        </CardSlot>
      </div>
    </section>
  );
}

