"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { SITE_CONFIG } from "@/lib/constants";
import BrandMark from "@/components/common/BrandMark";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const subcopyRef = useRef<HTMLParagraphElement>(null);

  // Instant entrance — content visible from page load, no scroll required
  useGSAP(
    () => {
      gsap.set([wordmarkRef.current, taglineRef.current, subcopyRef.current], {
        opacity: 0,
        y: 14,
      });

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.to(wordmarkRef.current, { opacity: 1, y: 0, duration: 1.1, delay: 0.15 })
        .to(taglineRef.current, { opacity: 1, y: 0, duration: 0.9 }, "-=0.55")
        .to(subcopyRef.current, { opacity: 1, y: 0, duration: 0.8 }, "-=0.45");
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] w-full p-3 md:p-4"
    >
      {/* Inner frame — rounded corners + thin black border breathing space */}
      <div className="relative h-full w-full overflow-hidden rounded-[60px]">
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
          {/* Wordmark — full bleed left, no max-width centering */}
          <div className="flex-1 flex items-start">
            <h1
              ref={wordmarkRef}
              className="text-creme font-semibold leading-[0.85] tracking-[-0.04em] text-[18vw] md:text-[15vw]"
            >
              <BrandMark registeredClassName="ml-[0.04em] text-[0.32em] align-super tracking-normal font-medium" />
            </h1>
          </div>

          {/* Bottom row — both texts span more width, larger sizes */}
          <div className="flex flex-col gap-10 pb-12 md:flex-row md:items-end md:justify-between md:gap-16">
            <p
              ref={taglineRef}
              className="text-creme max-w-2xl text-4xl font-light leading-[1.05] tracking-tight md:text-6xl whitespace-pre-line"
            >
              {SITE_CONFIG.heroTagline}
            </p>

            <p
              ref={subcopyRef}
              className="text-creme max-w-md text-lg font-semibold leading-snug md:text-xl"
            >
              {SITE_CONFIG.heroSubcopy}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
