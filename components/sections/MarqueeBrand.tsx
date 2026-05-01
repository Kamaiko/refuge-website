"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import Marquee from "@/components/common/Marquee";

export default function MarqueeBrand() {
  const wrapRef = useRef<HTMLDivElement>(null);

  // Parallax depth — INVERSED + more aggressive: marquee drifts opposite to scroll
  // direction with a wider Y range, giving a deeper "behind" feeling.
  useGSAP(
    () => {
      if (!wrapRef.current) return;
      gsap.fromTo(
        wrapRef.current,
        { yPercent: -45 },
        {
          yPercent: 45,
          ease: "none",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );
    },
    { scope: wrapRef },
  );

  return (
    <section
      aria-hidden
      className="relative w-full overflow-hidden py-24 md:py-32 select-none"
    >
      <div ref={wrapRef} className="will-change-transform">
        <Marquee
          text="Pourquoi Brume® ?"
          speed={140}
          separator="·"
          directional
          className="text-creme/90 text-[24vw] md:text-[14vw] font-semibold leading-none tracking-[-0.04em]"
        />
      </div>
    </section>
  );
}
