"use client";

import { useRef, type ElementType } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  children: string;
  as?: ElementType;
  className?: string;
  baseOpacity?: number;
  start?: string;
  end?: string;
};

/**
 * Scrub-driven per-word opacity reveal. Words start dim and fade to full opacity
 * as the user scrolls through the section. Iconic Apple-keynote / awwwards pattern.
 */
export default function ScrollTextReveal({
  children,
  as: Tag = "p",
  className,
  baseOpacity = 0.18,
  start = "top 80%",
  end = "bottom 60%",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const words = el.querySelectorAll<HTMLElement>(".stw-word");
      gsap.fromTo(
        words,
        { opacity: baseOpacity },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.04,
          scrollTrigger: {
            trigger: el,
            start,
            end,
            scrub: 1,
          },
        },
      );
    },
    { scope: ref, dependencies: [children] },
  );

  const words = children.split(/(\s+)/);

  return (
    <Tag ref={ref as React.Ref<HTMLElement>} className={cn(className)}>
      {words.map((w, i) =>
        /^\s+$/.test(w) ? (
          <span key={i}>{w}</span>
        ) : (
          <span key={i} className="stw-word inline-block">
            {w}
          </span>
        ),
      )}
    </Tag>
  );
}
