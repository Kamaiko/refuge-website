"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ACTIVITES } from "@/lib/data/activites";
import RevealText from "@/components/common/RevealText";
import RevealOnScroll from "@/components/common/RevealOnScroll";

export default function Activites() {
  const trigger = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const desktop = window.matchMedia("(min-width: 768px)");
      if (!desktop.matches) return; // mobile: native horizontal scroll only

      const t = trigger.current;
      const tr = track.current;
      if (!t || !tr) return;

      const totalWidth = tr.scrollWidth;
      const distance = totalWidth - window.innerWidth;
      if (distance <= 0) return;

      const tween = gsap.to(tr, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: t,
          start: "top top",
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        ScrollTrigger.refresh();
      };
    },
    { scope: trigger },
  );

  return (
    <section id="experiences" className="relative w-full">
      <div className="px-5 md:px-10 max-w-7xl mx-auto pt-32 mb-16">
        <div className="grid gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <RevealText
              mode="words"
              stagger={0.04}
              className="text-creme-dim text-xs uppercase tracking-[0.3em] mb-8"
            >
              Expériences
            </RevealText>

            <RevealText
              as="h2"
              mode="lines"
              stagger={0.1}
              className="text-creme text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight"
            >
              {"Six manières\nde prendre place."}
            </RevealText>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <RevealOnScroll y={16}>
              <p className="text-creme-dim text-base leading-relaxed mt-2">
                Le territoire propose ce qu’il a toujours proposé. On l’accompagne, on
                n’ajoute presque rien.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </div>

      {/* Pinned horizontal scroll on desktop, native horizontal scroll on mobile */}
      <div
        ref={trigger}
        className="relative overflow-hidden md:h-screen md:flex md:items-center"
      >
        <div className="md:overflow-visible overflow-x-auto no-scrollbar pb-8 md:pb-0">
          <div
            ref={track}
            className="flex gap-5 px-5 md:px-10 min-w-max md:min-w-0 will-change-transform"
          >
            {ACTIVITES.map((a, i) => (
              <article
                key={a.slug}
                className="relative w-[78vw] md:w-[420px] shrink-0"
                data-cursor="hover"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] bg-base-noir-soft group">
                  <div className="absolute inset-0 flex items-center justify-center text-creme-dim/40 text-sm transition-transform duration-700 group-hover:scale-105">
                    [{a.nom} — image AI]
                  </div>
                  <span className="absolute top-4 right-4 inline-flex rounded-full bg-base-noir/60 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-creme">
                    {a.intensite}
                  </span>
                  <span className="absolute top-4 left-4 inline-flex rounded-full border border-creme/30 px-3 py-1 text-[10px] tabular-nums text-creme/80">
                    {String(i + 1).padStart(2, "0")} / {String(ACTIVITES.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-creme text-xl font-semibold tracking-tight">
                      {a.nom}
                    </h3>
                    <p className="text-creme-dim mt-2 text-sm leading-relaxed">
                      {a.description}
                    </p>
                  </div>
                  <span className="text-creme-dim text-xs tabular-nums whitespace-nowrap mt-1">
                    {a.duree}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
