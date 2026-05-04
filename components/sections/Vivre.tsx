"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import RevealChars from "@/components/common/RevealChars";

/** Lifestyle features showcased between MarqueeBrand and Feedback. Three
 *  slides, alternating layout (text-left, image-left, text-left). The
 *  section is short-pinned while the wheel handler intercepts scroll
 *  ticks and advances slides at fixed speed — one tick = one slide,
 *  no queueing, no scroll-velocity coupling. */
const SLIDES = [
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

const TRAVEL_GAP_PX = -12;

/** Total duration of a slide-to-slide tween. Shorter than 1.5s because
 *  `power1.inOut` (used for symmetry between forward and backward) has
 *  a soft start; at 1.5s the user perceived a "wait" before the motion
 *  kicked in. 1.2s keeps the inOut symmetry while still feeling reactive. */
const TRANSITION_DURATION = 1.2;

/** Wait after `onComplete` of a tween before the next wheel tick can fire
 *  the next slide. Tiny — just enough to absorb the residual wheel events
 *  that trail a single trackpad gesture. */
const COOLDOWN_MS = 50;

/** Delay between the outgoing text's `play=false` and the incoming text's
 *  `play=true` during the slide 2 → 3 swap. Picks up where RevealChars's
 *  reverse-out finishes (≈ duration*0.5 + char_count*stagger*0.5). */
const TEXT_SWAP_DELAY_MS = 700;

/**
 * Three-slide horizontal carousel with **wheel-hijacked**, fixed-speed
 * transitions. Pinned via ScrollTrigger; while the pin is active, a
 * window-level wheel listener (capture phase) calls `preventDefault` +
 * `stopImmediatePropagation`, converts each tick into at most one
 * `tl.tweenTo("slideN")` call, and stops Lenis (via section-lock event
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
 * scales up 1.1 (zoom in as it leaves), layer 2 scales from 1.1 → 1
 * (zoom out as it arrives). Effects during 2→3: text content swaps
 * sequentially inside the travelling card; image fades + scales down.
 *
 * `position: relative; z-10` lets MarqueeBrand's parallaxed text slide
 * UNDER this section's painted area as the user scrolls into it.
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
  // run sequentially: text-2 fades out, then after TEXT_SWAP_DELAY_MS
  // text-3 fades in. Single-flag versions crossfade the two simultaneously.
  const [text2Active, setText2Active] = useState(true);
  const [text3Active, setText3Active] = useState(false);

  useGSAP(
    () => {
      // Initial state — applied on every viewport so slide 1 is the
      // visible default even when the desktop wheel handler is inactive.
      gsap.set(imageLayer1Ref.current, { clipPath: "inset(0% 0 0 0)" });
      gsap.set(imageScale2Ref.current, { scale: 1.25, transformOrigin: "center" });
      gsap.set(imageScale1Ref.current, { scale: 1, transformOrigin: "center" });
      gsap.set(textCardBRef.current, { yPercent: 110 });
      gsap.set(imageCardBRef.current, { yPercent: 110 });

      // Paused timeline with labels — one slide of stable rest at each
      // label, transitions are 1 unit long each.
      const tl = gsap.timeline({ paused: true });
      tl.addLabel("slide1", 0);

      // ─── Phase 1: slide 1 → slide 2 ────────────────────────────────
      // Movement tweens use `power1.inOut` — the only ease family that's
      // symmetric (mirror-image around the midpoint), so forward and
      // backward play feel identical. Linear is also symmetric but feels
      // mechanical; `power1.out` has more punch but is asymmetric (its
      // fast-start becomes a fast-end when reversed).
      tl.to(imageCardARef.current, {
        xPercent: -100,
        x: TRAVEL_GAP_PX,
        duration: 1,
        ease: "power1.inOut",
      }, "slide1");
      tl.to(imageLayer1Ref.current, {
        clipPath: "inset(100% 0 0 0)",
        duration: 0.95,
        // Curtain stays linear — its head moves at constant speed for an
        // even, mechanical descent rather than power's accelerating-then-
        // settling curve.
        ease: "none",
      }, "slide1");
      // Dolly: layer 1 zooms IN to 1.25 as it leaves; layer 2 zooms OUT
      // from 1.25 to 1 as it arrives. 25% scale is large enough to read
      // clearly at viewing distance.
      tl.to(imageScale1Ref.current, {
        scale: 1.25,
        duration: 1,
        ease: "power1.inOut",
      }, "slide1");
      tl.to(imageScale2Ref.current, {
        scale: 1,
        duration: 1,
        ease: "power1.inOut",
      }, "slide1");
      tl.to(textCardARef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.85,
        ease: "power1.inOut",
      }, "slide1");
      tl.to(textCardBRef.current, {
        yPercent: 0,
        duration: 1,
        ease: "power1.inOut",
      }, "slide1");
      tl.addLabel("slide2", "slide1+=1");

      // textCardB needs to cover imageCardA when it travels left in phase 2.
      // Started at z-15 (behind imageCardA) so it could rise BEHIND the
      // travelling image during phase 1; flip the stack at slide 2.
      tl.set(textCardBRef.current, { zIndex: 30 }, "slide2");

      // ─── Phase 2: slide 2 → slide 3 ────────────────────────────────
      tl.to(textCardBRef.current, {
        xPercent: -100,
        x: TRAVEL_GAP_PX,
        duration: 1,
        ease: "power1.inOut",
      }, "slide2");
      tl.to(imageCardARef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.85,
        ease: "power1.inOut",
      }, "slide2");
      tl.to(imageCardBRef.current, {
        yPercent: 0,
        duration: 1,
        ease: "power1.inOut",
      }, "slide2");
      tl.addLabel("slide3", "slide2+=1");

      // Desktop only: pin + wheel hijack. matchMedia auto-cleans up the
      // pin and the wheel listener if the user resizes across the boundary.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const setLock = (lock: boolean) => {
          window.dispatchEvent(
            new CustomEvent("section-lock", { detail: { lock } }),
          );
        };

        const trigger = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "+=200",
          pin: true,
          // Stop / start Lenis on pin enter / leave so a fast scroll
          // burst can't tween its way past us before our wheel handler
          // can engage. SmoothScroll listens for the section-lock event.
          onEnter: () => setLock(true),
          onLeave: () => setLock(false),
          onEnterBack: () => setLock(true),
          onLeaveBack: () => setLock(false),
        });

        const state = { currentSlide: 0, isAnimating: false };
        let canFire = true;
        const textSwapTimers: number[] = [];

        const queueTextSwap = (
          out: (v: boolean) => void,
          inn: (v: boolean) => void,
        ) => {
          // Clear any pending swap from a previous transition so a quick
          // back-to-back wouldn't fire stale timers.
          while (textSwapTimers.length) {
            const id = textSwapTimers.pop();
            if (id !== undefined) window.clearTimeout(id);
          }
          out(false);
          const id = window.setTimeout(() => inn(true), TEXT_SWAP_DELAY_MS);
          textSwapTimers.push(id);
        };

        const tweenTo = (target: number) => {
          if (state.isAnimating || state.currentSlide === target) return;
          const fromCurrent = state.currentSlide;
          state.isAnimating = true;
          canFire = false;

          // Text swap is needed only on the slide ↔ 2 ↔ 3 boundary —
          // textCardB carries text 2 by default; the swap to text 3
          // happens during the 2→3 travel. Going forward 1→2 (rising
          // the card) keeps text 2 visible; going back 2→1 (descending)
          // also leaves text 2 visible. Going back 3→2 reverts the swap.
          if (target === 2 && fromCurrent === 1) {
            queueTextSwap(setText2Active, setText3Active);
          } else if (target === 1 && fromCurrent === 2) {
            queueTextSwap(setText3Active, setText2Active);
          }

          tl.tweenTo(`slide${target + 1}`, {
            duration: TRANSITION_DURATION,
            ease: "power1.inOut",
            onComplete: () => {
              state.currentSlide = target;
              state.isAnimating = false;
              window.setTimeout(() => {
                canFire = true;
              }, COOLDOWN_MS);
            },
          });
        };

        const handleWheel = (e: WheelEvent) => {
          if (!trigger.isActive) return;
          const dir = e.deltaY > 0 ? "forward" : "backward";

          // Edge: slide 3 + forward → release pin forward.
          if (dir === "forward" && state.currentSlide === 2 && !state.isAnimating) {
            e.preventDefault();
            e.stopImmediatePropagation();
            window.scrollTo({ top: trigger.end + 50, behavior: "smooth" });
            return;
          }
          // Edge: slide 0 + backward → release pin backward.
          if (dir === "backward" && state.currentSlide === 0 && !state.isAnimating) {
            e.preventDefault();
            e.stopImmediatePropagation();
            window.scrollTo({ top: trigger.start - 50, behavior: "smooth" });
            return;
          }

          // In zone: hard-lock scroll. preventDefault stops native scroll;
          // stopImmediatePropagation prevents Lenis (bubbling-phase wheel
          // listener) from accumulating virtual scroll while we're in
          // control.
          e.preventDefault();
          e.stopImmediatePropagation();

          if (state.isAnimating || !canFire) return;

          if (dir === "forward") tweenTo(state.currentSlide + 1);
          else tweenTo(state.currentSlide - 1);
        };

        // capture: true so our handler fires before any bubbling-phase
        // listeners (notably Lenis's). passive: false so preventDefault
        // is honoured.
        window.addEventListener("wheel", handleWheel, { passive: false, capture: true });

        return () => {
          trigger.kill();
          window.removeEventListener("wheel", handleWheel, true);
          while (textSwapTimers.length) {
            const id = textSwapTimers.pop();
            if (id !== undefined) window.clearTimeout(id);
          }
          // Safety: release the lock if matchMedia tears this branch down
          // mid-engagement (e.g. resize across the md boundary).
          setLock(false);
        };
      });

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
          <CardText title={SLIDES[2].title} body={SLIDES[2].body} active={text3Active} stacked />
        </CardWrapper>
      </CardSlot>

      <CardSlot ref={imageCardARef} side="right" zClass="z-20">
        <div className="absolute inset-0 rounded-[40px] md:rounded-[60px] overflow-hidden">
          {/* Image 2 layer (behind) — dolly target imageScale2Ref. */}
          <div ref={imageScale2Ref} className="absolute inset-0">
            <Image
              src={SLIDES[1].image}
              alt=""
              fill
              sizes="50vw"
              unoptimized
              className="object-cover"
            />
          </div>
          {/* Image 1 layer (top) — clip-path target + dolly target. */}
          <div ref={imageLayer1Ref} className="absolute inset-0">
            <div ref={imageScale1Ref} className="absolute inset-0">
              <Image
                src={SLIDES[0].image}
                alt=""
                fill
                sizes="50vw"
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </CardSlot>

      <CardSlot ref={imageCardBRef} side="right" zClass="z-[25]">
        <div className="absolute inset-0 rounded-[40px] md:rounded-[60px] overflow-hidden">
          <Image
            src={SLIDES[2].image}
            alt=""
            fill
            sizes="50vw"
            unoptimized
            className="object-cover"
          />
        </div>
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

/** Text content layer — title + body anchored TOP-LEFT, RevealChars sweep
 *  driven by `active`. `stacked` lets two layers overlap inside the same
 *  CardWrapper (used by textCardB to swap text 2 ↔ text 3 sequentially). */
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
