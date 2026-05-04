"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { MQ } from "@/lib/breakpoints";
import { VIVRE } from "@/lib/motion";
import { dispatchSectionLock } from "@/lib/section-lock";
import RevealChars from "@/components/common/RevealChars";

type Slide = {
  title: string;
  body: string;
  image: string;
};

/** Lifestyle features showcased between MarqueeBrand and Feedback. Three
 *  slides, alternating layout (text-left, image-left, text-left). The
 *  section is short-pinned while the wheel handler intercepts scroll
 *  ticks and advances slides at fixed speed — one tick = one slide,
 *  no queueing, no scroll-velocity coupling. */
const SLIDES: readonly Slide[] = [
  {
    title: "Profitez de la vue",
    body: "à travers la grande fenêtre panoramique",
    image: "/images/unite-aubepine.avif",
  },
  {
    title: "Le silence retrouvé",
    body: "loin de l'agitation, dans une intimité totale",
    image: "/images/unite-galets.avif",
  },
  {
    title: "Détendez-vous",
    body: "dans un bain nordique en bois",
    image: "/images/unite-brume.avif",
  },
] as const;

/** Timeline labels — one per slide, indexed 0..N-1 to match `currentSlide`
 *  so call sites read `tl.tweenTo(LABELS[target])` with no off-by-one
 *  conversion. Length must equal `SLIDES.length`. */
const LABELS = ["slide-0", "slide-1", "slide-2"] as const;
const LAST_INDEX = SLIDES.length - 1;

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
 * Reduced-motion: skips the pin and wheel-hijack entirely; only slide 1
 * is shown (the carousel's mode of expression IS the motion).
 */
export default function Vivre() {
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
      const tl = gsap.timeline({ paused: true, defaults: { ease: VIVRE.ease } });
      tl.addLabel(LABELS[0], 0);

      // ─── Phase 1: slide 0 → slide 1 ────────────────────────────────
      tl.to(imageCardARef.current, {
        xPercent: -100,
        x: VIVRE.travelGapPx,
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
        x: VIVRE.travelGapPx,
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
          }, VIVRE.textSwapDelayMs);
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
            duration: VIVRE.transitionDuration,
            ease: VIVRE.ease,
            onComplete: () => {
              state.currentSlide = target;
              state.isAnimating = false;
              cooldownTimer = window.setTimeout(() => {
                canFire = true;
                cooldownTimer = null;
              }, VIVRE.cooldownMs);
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

      // Reduced-motion (any width): leave slide 1 as the static rest
      // state — the initial `gsap.set` calls above have already placed
      // every element correctly. No pin, no listeners.

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
      className="relative h-screen w-full overflow-hidden bg-base-noir z-10"
    >
      <CardSlot ref={textCardARef} side="left" zClass="z-10">
        <CardWrapper>
          <CardText title={SLIDES[0].title} body={SLIDES[0].body} active />
        </CardWrapper>
      </CardSlot>

      <CardSlot ref={textCardBRef} side="right" zClass="z-[15]">
        <CardWrapper>
          <CardText title={SLIDES[1].title} body={SLIDES[1].body} active={text2Active} />
          <CardText
            title={SLIDES[2].title}
            body={SLIDES[2].body}
            active={text3Active}
            stacked
          />
        </CardWrapper>
      </CardSlot>

      <CardSlot ref={imageCardARef} side="right" zClass="z-20">
        <RoundedFrame>
          {/* Image 2 layer (behind) — dolly target imageScale2Ref. */}
          <div ref={imageScale2Ref} className="absolute inset-0">
            <SlideImage src={SLIDES[1].image} />
          </div>
          {/* Image 1 layer (top) — clip-path target + dolly target. */}
          <div ref={imageLayer1Ref} className="absolute inset-0">
            <div ref={imageScale1Ref} className="absolute inset-0">
              <SlideImage src={SLIDES[0].image} />
            </div>
          </div>
        </RoundedFrame>
      </CardSlot>

      <CardSlot ref={imageCardBRef} side="right" zClass="z-[25]">
        <RoundedFrame>
          <SlideImage src={SLIDES[2].image} />
        </RoundedFrame>
      </CardSlot>
    </section>
  );
}

/** Absolutely-positioned half-width card slot. Width: `calc(50% - 1.125rem)`
 *  i.e. half the section minus 18px, which combined with the 12px outer
 *  inset and 12px center gap balances to a clean 12px gutter. */
function CardSlot({
  side,
  zClass,
  children,
  ref,
}: {
  side: "left" | "right";
  zClass: string;
  children: React.ReactNode;
  ref: React.Ref<HTMLDivElement>;
}) {
  const xClass = side === "left" ? "left-3" : "right-3";
  return (
    <div
      ref={ref}
      className={`absolute top-3 bottom-3 w-[calc(50%-1.125rem)] ${xClass} ${zClass} will-change-transform`}
    >
      {children}
    </div>
  );
}

/** Outer card body — the gris-tan rounded box with overflow clip. Holds
 *  one or more `CardText` content layers; only the wrapper carries the bg
 *  so stacked text layers don't paint over each other. Corners match the
 *  Capsules cards (`rounded-[40px] md:rounded-[60px]`). */
function CardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-full w-full bg-gris-tan rounded-[40px] md:rounded-[60px] overflow-hidden">
      {children}
    </div>
  );
}

/** Rounded image-card frame — same corner radius as `CardWrapper`, no bg.
 *  Wraps the absolute image layers so the rounded corners can clip them. */
function RoundedFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 rounded-[40px] md:rounded-[60px] overflow-hidden">
      {children}
    </div>
  );
}

/** Single full-bleed image inside a slide's frame. `unoptimized` because
 *  the source AVIFs are already encoded at the right size — Next's
 *  re-encode at quality 75 would only soften them. */
function SlideImage({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="50vw"
      unoptimized
      className="object-cover"
    />
  );
}

/** Text content layer — title + body anchored TOP-LEFT, RevealChars sweep
 *  driven by `active`. `stacked` lets two layers overlap inside the same
 *  CardWrapper (used by textCardB to swap text-2 ↔ text-3 sequentially). */
function CardText({
  title,
  body,
  active,
  stacked = false,
}: {
  title: string;
  body: string;
  active: boolean;
  stacked?: boolean;
}) {
  return (
    <div
      className={`${stacked ? "absolute" : "relative"} inset-0 h-full w-full p-10 md:p-16 flex flex-col justify-start`}
    >
      <RevealChars
        text={title}
        play={active}
        duration={1.0}
        stagger={0.025}
        className="block text-creme-terre/70 text-3xl md:text-5xl font-medium leading-[1.1] tracking-tight"
      />
      <div className="mt-4 text-creme-dim text-sm md:text-base leading-relaxed max-w-md">
        <RevealChars
          text={body}
          play={active}
          duration={1.0}
          delay={0.1}
          stagger={0.012}
        />
      </div>
    </div>
  );
}
