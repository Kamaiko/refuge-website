"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import RevealText from "@/components/common/RevealText";

export default function Medaillons() {
  const ref = useRef<HTMLDivElement>(null);
  const med1 = useRef<HTMLDivElement>(null);
  const med2 = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;

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
            className="relative aspect-[3/4] w-[58%] md:w-[70%] max-w-[280px] rounded-[50%] overflow-hidden bg-base-noir-soft will-change-transform"
          >
            <Image
              src="/images/unite-aubepine.avif"
              alt=""
              role="presentation"
              fill
              sizes="280px"
              className="object-cover object-[50%_30%]"
            />
          </div>
          <div
            ref={med2}
            className="relative aspect-[3/4] w-[58%] md:w-[70%] max-w-[280px] rounded-[50%] overflow-hidden bg-base-noir-soft self-end will-change-transform"
          >
            <Image
              src="/images/unite-galets.avif"
              alt=""
              role="presentation"
              fill
              sizes="280px"
              className="object-cover object-[65%_55%]"
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
            {"Un endroit\npour soi.\nUn endroit\npour faire silence."}
          </RevealText>

          <RevealText
            mode="lines"
            stagger={0.08}
            delay={0.3}
            className="text-creme-dim mt-10 max-w-md text-base leading-relaxed"
          >
            {"On y arrive presque sans bruit.\nOn en repart avec quelque chose en moins."}
          </RevealText>
        </div>
      </div>
    </section>
  );
}
