"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
 *  LCP strategy — the poster is rendered as a real `<img>` element
 *  underneath the `<video>`, instead of relying on the video's `poster`
 *  attribute. That way Chrome's LCP API unambiguously measures the
 *  `<img>` (a plain image element with a known src) rather than the
 *  containing `<video>` (which the heuristic was previously picking,
 *  even when no video frame had painted). The `<video>` itself is
 *  `preload="none"` + no `autoplay` + `opacity: 0` at mount, so it
 *  contributes nothing to the first paint. After `window.load`, the
 *  effect calls `.load()` then `.play()`; the `canplay` listener fades
 *  the video in over 600 ms once enough has buffered. */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const subcopyRef = useRef<HTMLParagraphElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  // Defer the video's network + decode work until after the page has
  // fully loaded. Reduced-motion users keep the poster permanently;
  // everyone else gets the loop swapped in moments after first paint.
  //
  // Three edge cases the simple `canplay` listener missed:
  //  1. Cached reload — the video buffer is already at HAVE_FUTURE_DATA
  //     (`readyState >= 3`) before we even attach the listener. Without
  //     the early check below, `canplay` never re-fires and the poster
  //     stays forever.
  //  2. Network stall — `canplay` may never resolve on flaky links.
  //     A 5 s safety timeout flips `videoReady` so the user at least
  //     gets the (partly-loaded) video instead of a permanent poster.
  //  3. Component unmount mid-load — every listener / timer is tracked
  //     and cleared in the cleanup.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // `HAVE_FUTURE_DATA` (3) means enough is buffered to play forward.
    if (video.readyState >= 3) {
      setVideoReady(true);
      video.play().catch(() => {});
      return;
    }

    const onCanPlay = () => setVideoReady(true);
    video.addEventListener("canplay", onCanPlay, { once: true });
    const stallFallback = window.setTimeout(() => setVideoReady(true), 5000);

    const start = () => {
      video.load();
      // `.play()` can reject on engines that gate autoplay even with
      // muted+playsinline — silently swallow, the poster stays as the
      // fallback visual.
      video.play().catch(() => {});
    };

    let timerId: number | undefined;
    if (document.readyState === "complete") {
      timerId = window.setTimeout(start, 0);
    } else {
      window.addEventListener("load", start, { once: true });
    }
    return () => {
      video.removeEventListener("canplay", onCanPlay);
      window.removeEventListener("load", start);
      window.clearTimeout(stallFallback);
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
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
          {/* Poster as a real <img> via next/image — this is what
              Lighthouse measures as LCP. The same file is preloaded by
              the <link rel="preload"> in app/layout.tsx so it's already
              in cache by the time React renders this element. `priority`
              tells next/image to add `fetchpriority="high"` and skip the
              default lazy loading. */}
          <Image
            src="/images/hero-shape.avif"
            alt=""
            aria-hidden
            fill
            priority
            sizes="100vw"
            unoptimized
            className="object-cover"
          />
          {/* Video layered above the poster but invisible at mount —
              `preload="none"` + no `autoplay` means the browser doesn't
              touch the 4 MB MP4 on the critical path. The effect above
              swaps `videoReady → true` once the `canplay` event fires,
              fading the video over the poster. */}
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:transition-none ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
          >
            <source src="/videos/hero-loop.mp4?v=5" type="video/mp4" />
          </video>
        </div>

        {/* Gradient overlay — sibling of mediaRef so it doesn't get
            scaled by the parallax tween. Top + bottom darkening for
            text contrast; middle stays clear so the refuge interior
            lights keep their full vibrance. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(24,23,23,0.55) 0%, rgba(24,23,23,0) 25%, rgba(24,23,23,0) 75%, rgba(24,23,23,0.3) 100%)",
          }}
        />

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
