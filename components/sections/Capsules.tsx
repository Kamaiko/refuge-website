"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { UNITES } from "@/lib/data/unites";
import { useReservePanel } from "@/components/common/ReservePanelContext";
import { CAPSULES } from "@/lib/motion";
import BrandMark from "@/components/common/BrandMark";

export default function Capsules() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const { open: openReservePanel } = useReservePanel();

  useGSAP(
    () => {
      const section = sectionRef.current;
      const cards = cardRefs.current.filter((c): c is HTMLDivElement => !!c);
      if (!section || cards.length !== 3) return;

      // Initial state: card 1 already centered as a capsule pill (medium size).
      // Cards 2 and 3 are off-screen below, ready to slide up.
      gsap.set(cards[0], {
        scale: 0.55,
        yPercent: 0,
        opacity: 1,
        zIndex: 1,
      });
      gsap.set(cards[1], { yPercent: 110, scale: 1, opacity: 1, zIndex: 2 });
      gsap.set(cards[2], { yPercent: 110, scale: 1, opacity: 1, zIndex: 3 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: CAPSULES.stickyDuration,
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            const p = self.progress;
            const idx = p < 1 / 3 ? 0 : p < 2 / 3 ? 1 : 2;
            setActiveIdx(idx);
          },
        },
      });

      // Phase 1 (0 → 33%): card 1 grows to fullscreen pill
      tl.to(cards[0], { scale: 1, duration: 1, ease: "none" }, 0);

      // Phase 2 (33 → 66%): card 2 slides up from bottom, card 1 scales down
      tl.to(cards[1], { yPercent: 0, duration: 1, ease: "none" }, 1)
        .to(cards[0], { scale: 1 - CAPSULES.scaleStep, duration: 1, ease: "none" }, 1);

      // Phase 3 (66 → 100%): card 3 slides up, card 2 scales down, card 1 scales down further
      tl.to(cards[2], { yPercent: 0, duration: 1, ease: "none" }, 2)
        .to(cards[1], { scale: 1 - CAPSULES.scaleStep, duration: 1, ease: "none" }, 2)
        .to(cards[0], { scale: 1 - CAPSULES.scaleStep * 2, duration: 1, ease: "none" }, 2);

      return () => {
        ScrollTrigger.getAll().forEach((t) => {
          if (t.trigger === section) t.kill();
        });
      };
    },
    { scope: sectionRef },
  );

  const progressPct = activeIdx === 0 ? 33 : activeIdx === 1 ? 66 : 100;

  return (
    <section
      ref={sectionRef}
      id="refuges"
      className="relative w-full bg-base-noir overflow-hidden"
      style={{ height: "100svh" }}
    >
      {/* Background wordmark — huge "Brume®", subtle, behind everything */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <span className="text-creme/[0.04] text-[28vw] font-semibold leading-none tracking-[-0.04em]">
          <BrandMark
            registeredClassName="ml-[0.04em] text-[0.32em] tracking-normal font-medium opacity-80"
            registeredStyle={{ verticalAlign: "-0.05em" }}
          />
        </span>
      </div>

      {/* Cards stack — each card is absolutely positioned to fill the viewport.
          Animations transform them in place. */}
      <div className="absolute inset-0 p-3 md:p-4">
        <div className="relative h-full w-full">
          {UNITES.map((unite, i) => (
            <div
              key={unite.slug}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute inset-0 will-change-transform"
            >
              <article className="relative h-full w-full overflow-hidden rounded-[60px] bg-base-noir-soft">
                <Image
                  src={unite.image}
                  alt={unite.nom}
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-base-noir/85 via-base-noir/30 to-base-noir/40" />

                <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-14">
                  <div className="flex items-start justify-between gap-6">
                    <span className="text-creme-dim text-xs uppercase tracking-[0.3em]">
                      {String(i + 1).padStart(2, "0")} / {String(UNITES.length).padStart(2, "0")}
                    </span>
                    <span className="text-creme-dim text-xs uppercase tracking-[0.3em] text-right">
                      {unite.particularite}
                    </span>
                  </div>

                  <div className="max-w-3xl">
                    <p className="text-creme-dim text-xs uppercase tracking-[0.3em] mb-4">
                      {unite.surnom}
                    </p>
                    <h3 className="text-creme text-6xl md:text-8xl lg:text-[10vw] font-semibold leading-[0.9] tracking-[-0.04em]">
                      {unite.nom}
                    </h3>
                    <p className="text-creme-dim mt-6 max-w-xl text-base md:text-lg leading-relaxed">
                      {unite.description}
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-6">
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

      {/* Loading bar — bottom-right, shows scroll progress through the 3 capsules */}
      <div className="absolute bottom-8 right-8 z-20 flex flex-col items-end gap-2 pointer-events-none">
        <span className="text-creme text-xs tabular-nums tracking-[0.2em] font-medium">
          {String(activeIdx + 1).padStart(2, "0")} / {String(UNITES.length).padStart(2, "0")}
        </span>
        <div className="h-[2px] w-32 rounded-full bg-creme/15 overflow-hidden">
          <div
            className="h-full bg-creme rounded-full transition-[width] duration-500"
            style={{ width: `${progressPct}%`, transitionTimingFunction: "var(--ease-cinematic)" }}
          />
        </div>
      </div>
    </section>
  );
}
