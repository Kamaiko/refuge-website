"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  scaleFrom?: number;
  scaleTo?: number;
  radiusFrom?: string;
  radiusTo?: string;
};

/**
 * Pin-and-scale reveal pattern. The card starts small + with a large border-radius,
 * then pins to the viewport while scrolling and grows to fill the screen.
 * The radius shrinks as the card grows. Cinematic centerpiece pattern.
 */
export default function PinScaleImage({
  children,
  className,
  scaleFrom = 0.45,
  scaleTo = 1,
  radiusFrom = "48px",
  radiusTo = "20px",
}: Props) {
  const trigger = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!trigger.current || !card.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trigger.current,
          start: "top top",
          end: "+=120%",
          scrub: 0.5,
          pin: true,
          pinSpacing: true,
        },
      });

      tl.fromTo(
        card.current,
        { scale: scaleFrom, borderRadius: radiusFrom },
        { scale: scaleTo, borderRadius: radiusTo, ease: "none" },
      );
    },
    { scope: trigger },
  );

  return (
    <div ref={trigger} className={cn("relative h-screen w-full overflow-hidden", className)}>
      <div
        ref={card}
        className="absolute inset-4 md:inset-10 will-change-transform overflow-hidden"
        style={{ borderRadius: radiusFrom }}
      >
        {children}
      </div>
    </div>
  );
}
