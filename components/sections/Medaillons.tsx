"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import RevealText from "@/components/common/RevealText";

/** Avant-goût section: two landscape medallion cards parallax in opposite
 *  directions on scroll, paired with three staggered {@link RevealText}
 *  blocks (eyebrow, headline, supporting copy). Reduced-motion: skips
 *  parallax, medallions sit at rest. */
export default function Medaillons() {
  const ref = useRef<HTMLDivElement>(null);
  const med1 = useRef<HTMLDivElement>(null);
  const med2 = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          med1.current,
          { y: -80 },
          {
            y: 80,
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );

        gsap.fromTo(
          med2.current,
          { y: 80 },
          {
            y: -80,
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="relative w-full px-5 md:px-10 py-32 md:py-40 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl grid gap-16 md:grid-cols-12 items-center">
        <div className="md:col-span-5 relative flex flex-col items-start gap-8 md:gap-10">
          <div
            ref={med1}
            className="relative aspect-[4/3] w-[82%] md:w-[88%] max-w-[440px] rounded-[28px] overflow-hidden bg-base-noir-soft will-change-transform"
          >
            <Image
              src="/images/medaillon-rassemblement.avif"
              alt=""
              role="presentation"
              fill
              sizes="440px"
              className="object-cover object-center"
            />
          </div>
          <div
            ref={med2}
            className="relative aspect-[4/3] w-[82%] md:w-[88%] max-w-[440px] rounded-[28px] overflow-hidden bg-base-noir-soft self-end will-change-transform"
          >
            <Image
              src="/images/medaillon-feu.avif"
              alt=""
              role="presentation"
              fill
              sizes="440px"
              className="object-cover object-center"
            />
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <RevealText
            mode="words"
            stagger={0.04}
            duration={0.9}
            className="text-creme-dim text-xs uppercase tracking-[0.3em] mb-8"
          >
            Avant-goût
          </RevealText>

          <RevealText
            as="h2"
            mode="lines"
            stagger={0.12}
            duration={1.2}
            className="text-creme text-3xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight"
          >
            {"Le jour pour soi.\nLe soir,\nensemble."}
          </RevealText>

          <RevealText
            mode="lines"
            stagger={0.08}
            delay={0.3}
            className="text-creme-dim mt-10 max-w-md text-base leading-relaxed"
          >
            {"On vient chercher le silence.\nOn finit par rester pour le feu, les voix, la nuit qui s'étire."}
          </RevealText>
        </div>
      </div>
    </section>
  );
}
