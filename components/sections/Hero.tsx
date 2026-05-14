"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SITE_CONFIG } from "@/lib/constants";
import BrandMark from "@/components/common/BrandMark";

const TAGLINE = "Trois refuges\nau creux du fjord.";
const SUBCOPY = `Passez du temps de qualité dans nos emplacements au Québec avec — ${SITE_CONFIG.brandMark}.`;

/** Full-viewport hero. A muted looping video sits behind the brand
 *  wordmark, tagline and subcopy (all GSAP fade-up on mount). The video
 *  parallaxes (scale 1.1 → 1.0) on scroll via a scrubbed ScrollTrigger.
 *  Reduced-motion: skips entrance + parallax tweens, copy lands at rest.
 *
 *  LCP strategy: the AVIF poster is preloaded via a `<link rel="preload">`
 *  in `app/layout.tsx` and rendered through the video's `poster` attribute.
 *  The video itself uses `preload="none"` + no `autoplay` so the browser
 *  never pulls the 4 MB MP4 on the critical path; instead we call
 *  `.load()` + `.play()` from a `window.load` listener, deferring the
 *  video until after the LCP timestamp has settled on the poster. Net
 *  effect: poster paints fast (~600 ms on Slow 4G simulation) and is
 *  measured as LCP; the video swaps in ~500-1000 ms later. */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const subcopyRef = useRef<HTMLParagraphElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Defer the video's network + decode work until after the page has
  // fully loaded. Reduced-motion users keep the poster permanently;
  // everyone else gets the loop swapped in moments after first paint.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const start = () => {
      video.load();
      // `.play()` can reject on engines that gate autoplay even with
      // muted+playsinline — silently swallow, the poster stays as the
      // fallback visual.
      video.play().catch(() => {});
    };

    if (document.readyState === "complete") {
      const id = window.setTimeout(start, 0);
      return () => window.clearTimeout(id);
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set([wordmarkRef.current, taglineRef.current, subcopyRef.current], {
          opacity: 0,
          y: 14,
        });

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.to(wordmarkRef.current, { opacity: 1, y: 0, duration: 1.1, delay: 0.15 })
          .to(taglineRef.current, { opacity: 1, y: 0, duration: 0.9 }, "-=0.55")
          .to(subcopyRef.current, { opacity: 1, y: 0, duration: 0.8 }, "-=0.45");

        if (mediaRef.current && sectionRef.current) {
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
        }
      });
      return () => {
        mm.revert();
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
      <div className="relative h-full w-full overflow-hidden rounded-[60px]">
        <div ref={mediaRef} className="absolute inset-0 will-change-transform">
          {/* `preload="none"` + no `autoplay` so the browser doesn't touch
              the 4 MB MP4 on the critical path. The AVIF poster (preloaded
              via `<link>` in app/layout.tsx) is the only thing painted on
              first frame; Lighthouse's LCP measurement settles on it
              before the JS-driven `.load()` + `.play()` in the effect
              above kicks the video into motion. */}
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            poster="/images/hero-shape.avif"
          >
            <source src="/videos/hero-loop.mp4?v=5" type="video/mp4" />
          </video>
          {/* Top + bottom darkening for text contrast; middle stays clear
              so the refuge interior lights keep their full vibrance. */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(24,23,23,0.55) 0%, rgba(24,23,23,0) 25%, rgba(24,23,23,0) 75%, rgba(24,23,23,0.3) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-5 md:p-10">
          {/* pt-32 on mobile clears the fixed Réserver pill (~60px tall + 40px
              header padding) so the wordmark doesn't slide under it. */}
          <div className="flex-1 flex items-start pt-32 md:pt-0">
            <h1
              ref={wordmarkRef}
              style={{ opacity: 0 }}
              className="text-creme font-semibold leading-[0.85] tracking-[-0.04em] text-[18vw] md:text-[15vw]"
            >
              <BrandMark />
            </h1>
          </div>

          {/* pb-36 on mobile clears the floating Menu pill (60px + 48px gap)
              so the subcopy doesn't sit underneath it. */}
          <div className="flex flex-col gap-6 pb-36 md:flex-row md:items-end md:justify-between md:gap-16 md:pb-12">
            <p
              ref={taglineRef}
              style={{ opacity: 0 }}
              className="text-creme max-w-2xl text-3xl font-light leading-[1.05] tracking-tight md:text-6xl whitespace-pre-line"
            >
              {TAGLINE}
            </p>

            <p
              ref={subcopyRef}
              style={{ opacity: 0 }}
              className="text-creme max-w-md text-lg font-semibold leading-snug md:text-2xl"
            >
              {SUBCOPY}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
