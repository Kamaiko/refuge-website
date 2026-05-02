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
import ArrowDiagonalIcon from "@/components/common/ArrowDiagonalIcon";

export default function Capsules() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardImageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const marqueeWrapRef = useRef<HTMLDivElement>(null);
  const loadingBarRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [revealActive, setRevealActive] = useState<boolean[]>([false, false, false]);
  const [progressPct, setProgressPct] = useState(0);
  const { open: openReservePanel } = useReservePanel();

  useGSAP(
    () => {
      const section = sectionRef.current;
      const cards = cardRefs.current.filter((c): c is HTMLDivElement => !!c);
      if (!section || cards.length !== 3) return;

      // Initial state: card 1 sits centered as a stadium pill (border-radius
      // managed below). Scale 0.42 — large enough to read as a presence on
      // its own, not just a tiny thumbnail floating in the bg marquee. Cards
      // 2 & 3 below the fold, ready to slide up.
      gsap.set(cards[0], { scale: 0.42, yPercent: 0, opacity: 1, zIndex: 1 });
      gsap.set(cards[1], { yPercent: 110, scale: 1, opacity: 1, zIndex: 2 });
      gsap.set(cards[2], { yPercent: 110, scale: 1, opacity: 1, zIndex: 3 });

      // Card 0's article (the visible rounded frame): stadium pill at rest,
      // tweened to a regular card radius as it grows to fullscreen.
      // Start value 540px = the browser's 50%-of-short-side cap on common
      // 1080p viewports, so any tween value below 540 is immediately
      // visible (no "plateau" while we wait to drop below the cap).
      // power1.out gives a gentle accelerating decrease — more uniform
      // perceptually than power2.out which front-loaded the change.
      const card0Article = cards[0].querySelector("article") as HTMLElement | null;
      if (card0Article) {
        gsap.set(card0Article, { borderRadius: "540px" });
      }

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

      // Timeline layout — total duration 5.5 units (extended via no-op tween
      // at position 4 so card 3's hold gets a full 1.5 units of sticky scroll).
      //   0    → 1    : Phase 1  — card 1 grows fullscreen + marquee dims
      //   1    → 1.5  : HOLD 1   — card 1 immobile (text reveal plays)
      //   1.5  → 2.5  : Phase 2  — card 2 slides up, card 1 scales down
      //   2.5  → 3    : HOLD 2   — card 2 immobile (text reveal plays)
      //   3    → 4    : Phase 3  — card 3 slides up, prior cards scale down
      //   4    → 5.5  : HOLD 3   — card 3 immobile, FULL 1.5 units (~10 ticks)
      // Scroll progress windows (scrub maps scroll 0→1 onto timeline 0→5.5):
      //   card 1 fullscreen = 1/5.5 - 1.5/5.5 = 0.182 - 0.273
      //   card 2 fullscreen = 2.5/5.5 - 3/5.5 = 0.455 - 0.545
      //   card 3 fullscreen = 4/5.5 - 5.5/5.5 = 0.727 - 1.000

      // Phase start positions for each card (used for image dolly + content tweens).
      // Aligned with the layout above: card 0 grows from 0, card 1 enters at 1.5,
      // card 2 enters at 3.
      const PHASE_STARTS = [0, 1.5, 3] as const;
      // Stack scale-down per card: card 0 ends 14% smaller (2 cards landed on
      // top of it), card 1 ends 7% smaller (1 card on top), card 2 stays at 1.
      const STACK_FINAL_SCALES = [
        1 - CAPSULES.scaleStep * 2,
        1 - CAPSULES.scaleStep,
        1,
      ] as const;
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

      // Image dolly: each card image zooms 1.35 → 1.0 during its OWN phase
      // (when its container is moving into position). One loop instead of
      // three near-identical tween calls.
      cardImageRefs.current.forEach((img, i) => {
        if (img) tl.to(img, { scale: 1, duration: 1, ease: "none" }, PHASE_STARTS[i]);
      });

      // Phase 1 (0 → 1): card 0 grows + article border-radius transitions
      // stadium pill → regular card radius + marquee dims hard.
      tl.to(cards[0], { scale: 1, duration: 1, ease: "none" }, PHASE_STARTS[0]);
      if (card0Article) {
        tl.to(card0Article, { borderRadius: "60px", duration: 1, ease: "power1.out" }, PHASE_STARTS[0]);
      }
      if (marqueeWrapRef.current) {
        // power2.out — opacity drops fast in the first half of the grow so
        // the marquee fade is clearly visible BEFORE card 1 covers most of
        // it. Linear (ease: "none") hid the change because the growing card
        // physically masked the marquee at the same rate the opacity dropped.
        tl.to(marqueeWrapRef.current, { opacity: 0.06, duration: 1, ease: "power2.out" }, PHASE_STARTS[0]);
      }

      // Phase 2 (1.5 → 2.5): card 1 slides in, card 0 scales down to its
      // stack-of-2 size. Section bg fades from gris-tan → base-noir so the
      // visible slivers around the cards (rounded corners, p-3/p-4 gutter)
      // smoothly recede to noir between cards.
      tl.to(cards[1], { yPercent: 0, duration: 1, ease: "none" }, PHASE_STARTS[1])
        .to(cards[0], { scale: STACK_FINAL_SCALES[1], duration: 1, ease: "none" }, PHASE_STARTS[1])
        .to(section, { backgroundColor: "var(--color-base-noir)", duration: 1, ease: "none" }, PHASE_STARTS[1]);

      // Phase 3 (3 → 4): card 2 slides in, prior cards scale down to their
      // final stack positions.
      tl.to(cards[2], { yPercent: 0, duration: 1, ease: "none" }, PHASE_STARTS[2])
        .to(cards[1], { scale: STACK_FINAL_SCALES[1], duration: 1, ease: "none" }, PHASE_STARTS[2])
        .to(cards[0], { scale: STACK_FINAL_SCALES[0], duration: 1, ease: "none" }, PHASE_STARTS[2]);

      // Hold 3 (4 → 5.5): empty no-op tween that extends the timeline
      // duration to 5.5 units. Without this, GSAP's scrub would map the full
      // scroll range (pin 6 viewports) onto a 4-unit timeline — card 3 would
      // only land fullscreen near scroll progress 1.0, killing the sticky hold.
      tl.to({}, { duration: 1.5 }, 4);

      return () => {
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
                // Card 0's border-radius is managed by GSAP (stadium pill at
                // rest → 60px when fullscreen). Cards 1 & 2 keep static
                // rounded-card radius via Tailwind class.
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
                    // unoptimized — sources are 2400×1340 AVIF, already
                    // small (~150KB each) and natively well-compressed.
                    // Next's default optimizer would downscale to 1920w and
                    // re-encode at quality 75, losing visible sharpness.
                    // unoptimized serves the source as-is; same bandwidth,
                    // full source sharpness preserved.
                    unoptimized
                    className="object-cover"
                  />
                </div>
                {/* No darkening overlay — image is rendered at its natural
                    exposure for maximum vibrance. If a particular photo's
                    lower area becomes too bright to read text against, add
                    a text-shadow on the labels rather than masking the image. */}

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

      {/* Exit-to-noir overlay was removed — redundant once the section's
          backgroundColor tween (during phase 2) takes the bg to base-noir
          before card 3 even lands, so a noir overlay over a noir bg was
          invisible anyway. The handoff to MarqueeBrand stays seamless via
          the section bg color alone. */}

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

/**
 * Card content overlay (eyebrow + title + description + Reserve CTA + meta)
 * rendered above each card image. Animation timing is driven by `play` —
 * RevealChars triggers char-wipe on title/eyebrow, the description block
 * slides in from the right, the CTA + meta fade in last.
 *
 * File-local sub-component: tightly coupled to Capsules's reveal timing and
 * design language; not meant to be reused outside this section.
 */
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
          stagger={0.018}
          duration={0.42}
          className="block text-creme-dim text-xs uppercase tracking-[0.3em] mb-4"
        />
      </div>
      {/* Title broken out of the max-w-3xl wrapper — at 8vw + tracking-[-0.04em]
          it needs more horizontal room than 768px allows on wide viewports,
          otherwise whitespace-nowrap pushes the trailing glyphs into the
          card's overflow-hidden clip. pr-8 reserves a hair of breathing room. */}
      <RevealChars
        text={unite.nom}
        play={play}
        delay={0.1}
        stagger={0}
        duration={0.95}
        className="block whitespace-nowrap pr-8 text-creme text-6xl md:text-8xl lg:text-[8vw] font-semibold leading-[0.9] tracking-[-0.04em]"
      />
      <div className="max-w-3xl">
        {/* Description — slides in as ONE block from the right AT THE SAME
            TIME as the title (no extra delay). Calmer counterpoint to the
            title's per-char wipe. */}
        <p
          className="block text-creme-dim mt-6 max-w-xl text-lg md:text-xl leading-relaxed transition-all duration-[900ms] ease-out will-change-transform"
          style={{
            opacity: play ? 1 : 0,
            transform: play ? "translateX(0)" : "translateX(40px)",
            transitionDelay: play ? "0.1s" : "0s",
          }}
        >
          {unite.description}
        </p>

        {/* Reserve CTA + meta — fade in WITH the text reveal so the whole
            content lands as a coherent block. */}
        <div
          className="mt-8 flex flex-wrap items-center gap-6 transition-opacity duration-700 ease-out"
          style={{
            opacity: play ? 1 : 0,
            transitionDelay: play ? "0.6s" : "0s",
          }}
        >
          <button
            type="button"
            onClick={onReserve}
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
