"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { SITE_CONFIG } from "@/lib/constants";
import RevealText from "@/components/common/RevealText";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Subtle fade-in of the scroll indicator after the wordmark settles
      if (scrollIndicatorRef.current) {
        gsap.fromTo(
          scrollIndicatorRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 1, delay: 1.6, ease: "expo.out" },
        );
      }
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] w-full overflow-hidden"
    >
      {/* Video loop background — crossfade-looped (last 0.5s blends into first 0.5s) */}
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-shape.avif"
        >
          <source src="/videos/hero-loop.mp4?v=5" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-base-noir/40 via-transparent to-base-noir/70" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between p-5 md:p-10">
        <div className="flex-1 flex items-start">
          <RevealText
            as="h1"
            mode="clip"
            duration={1.4}
            delay={0.4}
            className="text-creme font-semibold leading-[0.85] tracking-[-0.04em] text-[18vw] md:text-[15vw]"
          >
            {SITE_CONFIG.name}
          </RevealText>
        </div>

        <div className="flex flex-col gap-12 pb-16 md:flex-row md:items-end md:justify-between">
          <RevealText
            mode="lines"
            delay={1.0}
            duration={1.2}
            stagger={0.1}
            className="text-creme max-w-xs text-2xl font-light leading-tight md:text-3xl"
          >
            {SITE_CONFIG.heroTagline}
          </RevealText>

          <RevealText
            mode="lines"
            delay={1.3}
            duration={1.0}
            className="text-creme/70 max-w-xs text-sm leading-relaxed"
          >
            {SITE_CONFIG.heroSubcopy}
          </RevealText>
        </div>
      </div>

      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-24 right-5 md:right-10 z-10 flex flex-col items-center gap-2 text-creme/60"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Défiler</span>
        <span className="block h-8 w-px bg-creme/40" />
      </div>
    </section>
  );
}
