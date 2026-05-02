"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SITE_CONFIG } from "@/lib/constants";
import BrandMark from "@/components/common/BrandMark";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const subcopyRef = useRef<HTMLParagraphElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

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

  // Subtle scroll-driven zoom-out on the video — gives the hero a sense of
  // recession as the page begins. Range is 1.10 → 1.0 (never below 1.0) so
  // the video always fully covers the rounded-[60px] inner frame; below 1.0
  // it would shrink off the edges and reveal the noir behind. The 10%
  // upscale at rest is imperceptible on a moving video (motion masks the
  // interpolation artifacts of static images).
  useGSAP(
    () => {
      if (!mediaRef.current || !sectionRef.current) return;
      gsap.fromTo(
        mediaRef.current,
        { scale: 1.1 },
        {
          scale: 1.0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        },
      );
      return () => {
        ScrollTrigger.getAll().forEach((t) => {
          if (t.trigger === sectionRef.current) t.kill();
        });
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      data-hero
      className="relative h-[100svh] w-full p-3 md:p-4"
    >
      {/* Inner frame — rounded corners + thin black border breathing space */}
      <div className="relative h-full w-full overflow-hidden rounded-[60px]">
        <div ref={mediaRef} className="absolute inset-0 will-change-transform">
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
          {/* Asymmetric darkening overlay — top 25% fades to 55% noir
              (wordmark contrast), middle 50% stays fully transparent so the
              warm refuge interior lights are preserved at full vibrance,
              bottom 25% fades to 30% noir (gentler than the previous 70%)
              for tagline/subcopy contrast. */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(24,23,23,0.55) 0%, rgba(24,23,23,0) 25%, rgba(24,23,23,0) 75%, rgba(24,23,23,0.3) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-5 md:p-10">
          {/* Wordmark — full bleed left, no max-width centering */}
          <div className="flex-1 flex items-start">
            <h1
              ref={wordmarkRef}
              className="text-creme font-semibold leading-[0.85] tracking-[-0.04em] text-[18vw] md:text-[15vw]"
            >
              <BrandMark />
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
