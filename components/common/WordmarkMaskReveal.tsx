"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  word: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
};

/**
 * "Capsule mask" reveal.
 * A wordmark sits inside a pill-shaped container at moderate size. As the user
 * scrolls (section pinned), the pill grows toward fullscreen, the word fades out,
 * and an image fades in inside the pill. Acts as a cinematic transition into the
 * units showcase.
 */
export default function WordmarkMaskReveal({
  word,
  imageSrc,
  imageAlt = "",
  className,
}: Props) {
  const trigger = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const imgWrap = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!trigger.current || !pill.current || !wordRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trigger.current,
          start: "top top",
          end: "+=140%",
          scrub: 0.5,
          pin: true,
          pinSpacing: true,
        },
      });

      // Pill grows from a moderate pill to nearly fullscreen.
      // border-radius shrinks as the pill becomes a rounded rectangle.
      tl.fromTo(
        pill.current,
        { scale: 0.55, borderRadius: "9999px" },
        { scale: 1.6, borderRadius: "32px", ease: "none" },
        0,
      );

      // Word fades out in the first half of the scroll.
      tl.to(wordRef.current, { opacity: 0, ease: "none", duration: 0.5 }, 0);

      // Image fades in in the second half.
      if (imgWrap.current) {
        tl.fromTo(
          imgWrap.current,
          { opacity: 0 },
          { opacity: 1, ease: "none", duration: 0.5 },
          0.4,
        );
      }
    },
    { scope: trigger },
  );

  return (
    <div
      ref={trigger}
      className={cn(
        "relative h-screen w-full flex items-center justify-center overflow-hidden",
        className,
      )}
    >
      <div
        ref={pill}
        className="relative w-[78vw] max-w-[860px] aspect-[2/1] overflow-hidden bg-base-noir-soft will-change-transform"
        style={{ borderRadius: "9999px" }}
      >
        {imageSrc && (
          <div ref={imgWrap} className="absolute inset-0" style={{ opacity: 0 }}>
            <img
              src={imageSrc}
              alt={imageAlt}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-base-noir/40 via-transparent to-transparent" />
          </div>
        )}
        <span
          ref={wordRef}
          className="absolute inset-0 flex items-center justify-center text-creme font-semibold leading-none tracking-[-0.03em] text-[16vw] md:text-[12vw]"
        >
          {word}
        </span>
      </div>
    </div>
  );
}
