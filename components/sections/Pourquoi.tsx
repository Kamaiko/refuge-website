"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { MQ } from "@/lib/breakpoints";
import { POURQUOI } from "@/lib/motion";
import { dispatchSectionLock } from "@/lib/section-lock";
import RevealChars from "@/components/common/RevealChars";
import SlideIndicators from "@/components/common/SlideIndicators";

type Slide = {
  title: string;
  body: string;
  image: string;
};

/** Three reasons answering the "Pourquoi Aquilon ?" question posed by
 *  MarqueeBrand directly above. Three slides, alternating layout
 *  (text-left, image-left, text-left). The section is short-pinned
 *  while the wheel handler intercepts scroll ticks and advances slides
 *  at fixed speed — one tick = one slide, no queueing, no
 *  scroll-velocity coupling. */
const SLIDES: readonly Slide[] = [
  {
    title: "Un endroit pour ceux qui prennent leur temps—sans avoir à se justifier",
    body: "Personne ne vous chronomètre. Le seul calendrier ici, c'est la lumière qui tombe sur le fjord.",
    image: "/images/refuge-brume.avif",
  },
  {
    title: "Profitez de la vue—par la grande baie vitrée panoramique",
    body: "Une fenêtre ouverte sur l'eau et le ciel, qui se renouvelle à chaque heure du jour.",
    image: "/images/refuge-galets.avif",
  },
  {
    title: "Le temps s'étire—loin du tumulte, dans une intimité totale",
    body: "Ici, chaque souffle de la forêt boréale vous recharge — votre sanctuaire d'isolement vous attend.",
    image: "/images/refuge-aubepine.avif",
  },
] as const;

/** Timeline labels — one per slide, indexed 0..N-1 to match `currentSlide`
 *  so call sites read `tl.tweenTo(LABELS[target])` with no off-by-one
 *  conversion. Length must equal `SLIDES.length`. */
const LABELS = ["slide-0", "slide-1", "slide-2"] as const;
const LAST_INDEX = SLIDES.length - 1;

/**
 * Single source of truth for the carousel's internal text rhythm.
 *
 * Principle: do NOT ballpark the text-swap delay. Every text timing is
 * **derived** from `POURQUOI.transitionDuration` (the card-slide duration),
 * so changing one knob keeps everything in sync.
 *
 * Sizing rationale:
 *  - `revealDuration` ≈ half the card slide. The longest title's full
 *    reveal then takes ≈ `transitionDuration * 0.5 + chars * stagger`,
 *    which lands within (or just at the end of) the slide window.
 *  - `swapDelayMs` matches the RevealChars **reverse-out** time for the
 *    longest title — so the moment text-2 finishes fading out is exactly
 *    when text-3 starts fading in, both visible only while the card is
 *    travelling right-to-left.
 *
 * RevealChars internal formulas (from its source):
 *  - forward play time   = `duration + (chars - 1) * stagger`
 *  - reverse-out time    = `duration * 0.5 + (chars - 1) * stagger * 0.5`
 */
const TEXT_REVEAL = {
  /** Used for both the title (small stagger) and body (smaller still). */
  duration: POURQUOI.transitionDuration * 0.55,
  titleStagger: 0.012,
  bodyStagger: 0.008,
  bodyDelay: 0.05,
} as const;

const MAX_TITLE_CHARS = Math.max(...SLIDES.map((s) => s.title.length));

/** Derived from the longest title's reverse-out time at the title config
 *  above. Fires text-3's `play=true` exactly when text-2's reverse-out
 *  finishes — no overlap, no gap, no hand-tuned constant. */
const TEXT_SWAP_DELAY_MS = Math.round(
  (TEXT_REVEAL.duration * 0.5 +
    Math.max(0, MAX_TITLE_CHARS - 1) * TEXT_REVEAL.titleStagger * 0.5) *
    1000,
);

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
      id="pourquoi"
      className="relative w-full overflow-hidden bg-base-noir z-10 md:h-screen"
    >
      {/* Mobile: vertical stack — small gris-tan text card on top,
          larger image card below. The wheel-hijack carousel doesn't fit
          a 50/50 column layout below 768px, so we drop it entirely on
          mobile and let the user scroll through the three slides
          naturally. */}
      <div className="md:hidden flex flex-col gap-12 px-3 py-16">
        {SLIDES.map((slide, i) => (
          <article key={slide.title} className="flex flex-col gap-3">
            <div className="bg-gris-tan rounded-[28px] p-7 flex flex-col gap-6">
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
            <div className="relative aspect-[4/5] w-full rounded-[28px] overflow-hidden">
              <Image
                src={slide.image}
                alt=""
                fill
                sizes="100vw"
                unoptimized
                className="object-cover"
              />
            </div>
          </article>
        ))}
      </div>

      {/* Desktop: absolutely-positioned wheel-hijack carousel. Hidden on
          mobile. The cards are `position: absolute` to the section
          (closest positioned ancestor); the wrapper here is just a
          display gate, not a containing block. */}
      <div className="hidden md:block">
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
            {/* Image 2 layer (behind) — dolly target imageScale2Ref. */}
            <div ref={imageScale2Ref} className="absolute inset-0">
              <SlideImage src={SLIDES[1].image} objectPosition="35% 50%" />
            </div>
            {/* Image 1 layer (top) — clip-path target + dolly target. */}
            <div ref={imageLayer1Ref} className="absolute inset-0">
              <div ref={imageScale1Ref} className="absolute inset-0">
                <SlideImage src={SLIDES[0].image} objectPosition="95% 50%" />
              </div>
            </div>
          </RoundedFrame>
        </CardSlot>

        <CardSlot ref={imageCardBRef} side="right" zClass="z-[25]">
          <RoundedFrame>
            <SlideImage src={SLIDES[2].image} objectPosition="30% 50%" scale={1.5} />
          </RoundedFrame>
        </CardSlot>
      </div>
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
 *  Hebergements cards (`rounded-[40px] md:rounded-[60px]`). */
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
 *  re-encode at quality 75 would only soften them. `scale` tightens the
 *  crop (defaults to 1.3, composes multiplicatively with the GSAP dolly
 *  on imageCardA). `objectPosition` shifts the visible framing — lower
 *  X% pulls focal point left, higher X% pulls it right. */
function SlideImage({
  src,
  objectPosition = "50% 50%",
  scale = 1.3,
}: {
  src: string;
  objectPosition?: string;
  scale?: number;
}) {
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="50vw"
      unoptimized
      className="object-cover"
      style={{ objectPosition, transform: `scale(${scale})` }}
    />
  );
}

/** Text content layer — title TOP-LEFT (large), pagination indicators
 *  BOTTOM-LEFT, secondary copy BOTTOM-RIGHT. RevealChars sweep is driven
 *  by `active`. `stacked` lets two layers overlap inside the same
 *  CardWrapper (used by textCardB to swap text-2 ↔ text-3 sequentially).
 *  `index`/`total` feed the `01 / 03` pagination chips. */
function CardText({
  title,
  body,
  active,
  index,
  total,
  stacked = false,
}: {
  title: string;
  body: string;
  active: boolean;
  index: number;
  total: number;
  stacked?: boolean;
}) {
  // Hide inactive layer entirely — prevents per-glyph mask sub-pixel
  // leak from bleeding through. The 500ms delay must outlast the
  // longest RevealChars reverse-out at TEXT_REVEAL settings; if those
  // change, this needs to grow accordingly.
  const inactiveOpacityClass = active
    ? "opacity-100 delay-0"
    : "opacity-0 delay-500";
  return (
    <div
      className={`${stacked ? "absolute" : "relative"} inset-0 h-full w-full p-10 md:p-14 lg:p-16 flex flex-col justify-between gap-8 transition-opacity duration-300 ${inactiveOpacityClass}`}
    >
      <RevealChars
        text={title}
        play={active}
        duration={TEXT_REVEAL.duration}
        stagger={TEXT_REVEAL.titleStagger}
        className="block text-creme-terre/85 text-3xl xs:text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.05] tracking-tight"
      />

      {/* Symmetric inset on the bottom row keeps both ends clear of the
          fixed Menu pill at viewport bottom-center AND keeps the visual
          rhythm consistent card-to-card — every card gets the same
          horizontal breathing room, regardless of which side it sits on. */}
      <div className="flex items-end justify-between gap-6 px-12 md:px-16 lg:px-20">
        <SlideIndicators
          current={index}
          total={total}
          active={active}
          shiftLeft={index !== 2}
        />
        <div className="text-creme text-xl md:text-2xl leading-snug max-w-lg text-right font-semibold">
          <RevealChars
            text={body}
            play={active}
            duration={TEXT_REVEAL.duration}
            delay={TEXT_REVEAL.bodyDelay}
            stagger={TEXT_REVEAL.bodyStagger}
          />
        </div>
      </div>
    </div>
  );
}

