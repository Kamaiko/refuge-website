"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  start?: string;
  stagger?: number;
};

/**
 * Generic scroll reveal: children fade in + translate up when entering viewport.
 * If the wrapped element has direct children, they stagger.
 */
export default function RevealOnScroll({
  children,
  className,
  delay = 0,
  y = 32,
  duration = 1.1,
  start = "top 85%",
  stagger = 0.08,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const directChildren = Array.from(el.children) as HTMLElement[];
      const targets = directChildren.length > 0 ? directChildren : [el];

      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          stagger,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start, once: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
