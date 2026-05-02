"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { UNITES } from "@/lib/data/unites";
import { useReservePanel } from "@/components/common/ReservePanelContext";
import { CAPSULES } from "@/lib/motion";
import Marquee from "@/components/common/Marquee";
import RevealChars from "@/components/common/RevealChars";

export default function Capsules() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardImageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const marqueeWrapRef = useRef<HTMLDivElement>(null);
  const loadingBarRef = useRef<HTMLDivElement>(null);
  const exitOverlayRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [revealActive, setRevealActive] = useState<boolean[]>([false, false, false]);
  const [progressPct, setProgressPct] = useState(0);
  const { open: openReservePanel } = useReservePanel();

  useGSAP(
    () => {
      const section = sectionRef.current;
      const cards = cardRefs.current.filter((c): c is HTMLDivElement => !!c);
      if (!section || cards.length !== 3) return;

      // Initial state: card 1 sits centered, very small with extra-rounded
      // corners (rounded-[100px]) so the bg marquee text passes BEHIND the
      // image. Cards 2 & 3 below the fold.
      gsap.set(cards[0], { scale: 0.32, yPercent: 0, opacity: 1, zIndex: 1 });
      gsap.set(cards[1], { yPercent: 110, scale: 1, opacity: 1, zIndex: 2 });
      gsap.set(cards[2], { yPercent: 110, scale: 1, opacity: 1, zIndex: 3 });

      // Dolly-zoom framing: each card image starts strongly zoomed-in (scale
      // 1.35) so the small initial capsule reveals only a tight crop. As the
      // card takes its position, the image zooms OUT to scale 1 — more of
      // the scene is revealed alongside the growing frame (like a camera
      // pulling back while the framing widens). Scroll-tied via the main
      // timeline — no idle loop, no yoyo.
      cardImageRefs.current.forEach((img) => {
        if (img) gsap.set(img, { scale: 1.35 });
      });

      // Background marquee starts bright white; fades to dim grey as card 1
      // grows to fullscreen (phase 1).
      if (marqueeWrapRef.current) {
        gsap.set(marqueeWrapRef.current, { opacity: 1 });
      }

      // Loading bar starts hidden — appears together with the first card's
      // text reveal, stays visible through the rest of the slideshow.
      if (loadingBarRef.current) {
        gsap.set(loadingBarRef.current, { opacity: 0 });
      }

      // Exit overlay starts invisible — fades in across the final hold so the
      // viewport is fully noir before the section unpins and MarqueeBrand
      // (also noir) takes over. Mirror of the Choisir gradient (noir → tan)
      // but reversed (tan → noir).
      if (exitOverlayRef.current) {
        gsap.set(exitOverlayRef.current, { opacity: 0 });
      }

      // Timeline layout (6 units total)
      //   0    → 1    : Phase 1  — card 1 grows fullscreen + marquee dims
      //   1    → 1.5  : HOLD 1   — card 1 immobile (text reveal plays)
      //   1.5  → 2.5  : Phase 2  — card 2 slides up, card 1 scales down
      //   2.5  → 3    : HOLD 2   — card 2 immobile (text reveal plays)
      //   3    → 4    : Phase 3  — card 3 slides up, prior cards scale down
      //   4    → 5.5  : HOLD 3   — card 3 immobile, FULL 1.5 units (clearly
      //                            sticky for ~10 ticks of scroll)
      //   5.5  → 6    : EXIT     — overlay fades to noir for the unpin handoff
      // Progress windows (6 units total):
      // Timeline duration ends up at 5.5 (after the no-op tween below).
      // Scroll progress windows when scrub maps scroll 0→1 to timeline 0→5.5:
      //   card 1 fullscreen = 1/5.5 - 1.5/5.5 = 0.182 - 0.273
      //   card 2 fullscreen = 2.5/5.5 - 3/5.5 = 0.455 - 0.545
      //   card 3 fullscreen = 4/5.5 - 5.5/5.5 = 0.727 - 1.000
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: CAPSULES.stickyDuration,
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

            setProgressPct(Math.round(p * 100));
          },
        },
      });

      // Phase 1 (0 → 1): card 1 grows + image dolly + marquee dims
      tl.to(cards[0], { scale: 1, duration: 1, ease: "none" }, 0);
      if (cardImageRefs.current[0]) {
        tl.to(cardImageRefs.current[0], { scale: 1, duration: 1, ease: "none" }, 0);
      }
      if (marqueeWrapRef.current) {
        tl.to(marqueeWrapRef.current, { opacity: 0.06, duration: 1, ease: "none" }, 0);
      }
      // Phase 2 (1.5 → 2.5): card 2 slides in + image dolly, card 1 scales down
      tl.to(cards[1], { yPercent: 0, duration: 1, ease: "none" }, 1.5)
        .to(cards[0], { scale: 1 - CAPSULES.scaleStep, duration: 1, ease: "none" }, 1.5);
      if (cardImageRefs.current[1]) {
        tl.to(cardImageRefs.current[1], { scale: 1, duration: 1, ease: "none" }, 1.5);
      }
      // Phase 3 (3 → 4): card 3 slides in + image dolly, prior cards scale down
      tl.to(cards[2], { yPercent: 0, duration: 1, ease: "none" }, 3)
        .to(cards[1], { scale: 1 - CAPSULES.scaleStep, duration: 1, ease: "none" }, 3)
        .to(cards[0], { scale: 1 - CAPSULES.scaleStep * 2, duration: 1, ease: "none" }, 3);
      if (cardImageRefs.current[2]) {
        tl.to(cardImageRefs.current[2], { scale: 1, duration: 1, ease: "none" }, 3);
      }
      // Hold 3 (4 → 5.5): empty no-op tween that extends the timeline
      // duration to 5.5 units. Without this, GSAP's scrub would map the full
      // scroll range (pin 6 viewports) onto a 4-unit timeline — card 3 would
      // only land fullscreen near scroll progress 1.0, killing the sticky hold.
      tl.to({}, { duration: 1.5 }, 4);
      // Exit overlay is NOT in the main timeline. It fades in via a SEPARATE
      // ScrollTrigger during the post-pin scroll — i.e., once the section
      // unpins and starts scrolling out naturally, the overlay (which lives
      // inside the section so it scrolls with it) builds up to 100% noir.
      // By the time the section is fully past the viewport, both halves of
      // the screen are noir (overlay below + MarqueeBrand bg above), giving
      // a seamless handoff.
      const exitTrigger = ScrollTrigger.create({
        trigger: section,
        // Fade starts ~20vh after the pin ends (section already moving up)
        // and reaches 100% noir when the section's bottom is in the upper
        // third of the viewport — i.e., card 3 is mostly out of view by the
        // top, smooth handoff to the noir MarqueeBrand below.
        start: "bottom 80%",
        end: "bottom 33%",
        scrub: 0.5,
        onUpdate: (self) => {
          if (exitOverlayRef.current) {
            gsap.set(exitOverlayRef.current, { opacity: self.progress });
          }
        },
      });

      return () => {
        exitTrigger.kill();
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
      {/* Background — scrolling "Brume" wordmark, starts bright white,
          fades to dim grey as card 1 takes the viewport. */}
      <div
        ref={marqueeWrapRef}
        aria-hidden
        className="absolute inset-0 flex items-center pointer-events-none select-none z-0"
      >
        <Marquee
          text="Brume®"
          speed={140}
          separator="·"
          className="text-creme text-[14vw] md:text-[12vw] font-semibold leading-none tracking-[-0.04em]"
        />
      </div>

      {/* Cards stack — z-10 so cards sit above the bg marquee text. */}
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
                className={`relative h-full w-full overflow-hidden bg-base-noir-soft ${
                  i === 0 ? "rounded-[100px] md:rounded-[120px]" : "rounded-[40px] md:rounded-[60px]"
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
                    className="object-cover"
                  />
                </div>
                {/* Bottom-only gradient for text legibility — leaves the upper
                    image untouched so the photograph reads at its natural
                    exposure (no global darkening). */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-base-noir/75 via-base-noir/30 to-transparent" />

                <div className="relative z-10 flex h-full flex-col justify-end p-8 md:p-14">
                  <div className="max-w-3xl">
                    <RevealChars
                      text={unite.surnom}
                      play={revealActive[i] ?? false}
                      stagger={0.018}
                      duration={0.42}
                      className="block text-creme-dim text-xs uppercase tracking-[0.3em] mb-4"
                    />
                    <RevealChars
                      text={unite.nom}
                      play={revealActive[i] ?? false}
                      delay={0.1}
                      stagger={0.034}
                      duration={0.55}
                      className="block whitespace-nowrap text-creme text-6xl md:text-8xl lg:text-[8vw] font-semibold leading-[0.9] tracking-[-0.04em]"
                    />
                    <RevealChars
                      text={unite.description}
                      play={revealActive[i] ?? false}
                      delay={0.2}
                      stagger={0.005}
                      duration={0.4}
                      className="block text-creme-dim mt-6 max-w-xl text-base md:text-lg leading-relaxed"
                    />

                    {/* Reserve CTA + meta — fade in WITH the text reveal so
                        the whole content lands as a coherent block. */}
                    <div
                      className="mt-8 flex flex-wrap items-center gap-6 transition-opacity duration-700 ease-out"
                      style={{
                        opacity: revealActive[i] ? 1 : 0,
                        transitionDelay: revealActive[i] ? "0.6s" : "0s",
                      }}
                    >
                      <button
                        type="button"
                        onClick={openReservePanel}
                        className="inline-flex items-center gap-3 rounded-pill bg-creme px-6 py-3 text-sm font-medium text-base-noir transition-opacity hover:opacity-90"
                      >
                        Réserver {unite.nom}
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                          <path d="M3 11L11 3M11 3H4M11 3V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <div className="flex items-center gap-6 text-creme-dim text-xs">
                        <span>{unite.capacite}</span>
                        <span className="opacity-40">·</span>
                        <span>{unite.surface}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      {/* Exit overlay — solid base-noir, opacity scrubbed by a separate
          ScrollTrigger that fires only after the pin ends (= section starts
          scrolling out). Reaches 100% noir as the section bottom leaves the
          viewport top, providing a seamless handoff to the noir MarqueeBrand
          section above it. */}
      <div
        ref={exitOverlayRef}
        aria-hidden
        className="absolute inset-0 z-50 pointer-events-none bg-base-noir"
        style={{ opacity: 0 }}
      />

      {/* Loading bar — centered in the lower-right quadrant (≈25vh from
          bottom, ≈12vw from right). 2.5x wider than before so the progress
          reads at a glance from across the room. Fades in with the first
          card's text reveal, stays visible through the slideshow. */}
      <div
        ref={loadingBarRef}
        className="absolute z-40 pointer-events-none"
        style={{ bottom: "8vh", right: "8vw" }}
      >
        <div className="h-[3px] w-[28rem] rounded-full bg-creme/15 overflow-hidden">
          <div
            className="h-full bg-creme rounded-full transition-[width] duration-300"
            style={{ width: `${progressPct}%`, transitionTimingFunction: "var(--ease-cinematic)" }}
          />
        </div>
      </div>
    </section>
  );
}
