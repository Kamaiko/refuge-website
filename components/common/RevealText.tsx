"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type RevealMode = "lines" | "words" | "chars" | "clip";

type Props = {
  children: string;
  as?: ElementType;
  mode?: RevealMode;
  className?: string;
  stagger?: number;
  duration?: number;
  delay?: number;
  start?: string;
  ease?: string;
};

/**
 * Scroll-triggered text reveal.
 * - lines: splits on \n, each line slides up from below an overflow-hidden mask
 * - words: each word slides up from below
 * - chars: each character slides in from the right
 * - clip: clip-path inset top→bottom reveal on the whole block
 */
export default function RevealText({
  children,
  as: Tag = "p",
  mode = "lines",
  className,
  stagger = 0.08,
  duration = 1.1,
  delay = 0,
  start = "top 85%",
  ease = "expo.out",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (mode === "clip") {
        gsap.fromTo(
          el,
          { clipPath: "inset(0% 0% 100% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration,
            delay,
            ease,
            scrollTrigger: { trigger: el, start, once: true },
          },
        );
        return;
      }

      const targets = el.querySelectorAll<HTMLElement>(".reveal-inner");
      if (mode === "chars") {
        gsap.fromTo(
          targets,
          { xPercent: 110, opacity: 0 },
          {
            xPercent: 0,
            opacity: 1,
            duration,
            delay,
            ease,
            stagger,
            scrollTrigger: { trigger: el, start, once: true },
          },
        );
      } else {
        gsap.fromTo(
          targets,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration,
            delay,
            ease,
            stagger,
            scrollTrigger: { trigger: el, start, once: true },
          },
        );
      }
    },
    { scope: ref, dependencies: [children, mode] },
  );

  // Build the children content based on mode
  let content: ReactNode = children;

  if (mode === "lines") {
    const lines = children.split("\n");
    content = lines.map((line, i) => (
      <span key={i} className="block overflow-hidden">
        <span className="reveal-inner block">{line || " "}</span>
      </span>
    ));
  } else if (mode === "words") {
    const words = children.split(/(\s+)/);
    content = (
      <span className="inline-block">
        {words.map((word, i) =>
          /^\s+$/.test(word) ? (
            <span key={i}>{word}</span>
          ) : (
            <span key={i} className="inline-block overflow-hidden align-bottom">
              <span className="reveal-inner inline-block">{word}</span>
            </span>
          ),
        )}
      </span>
    );
  } else if (mode === "chars") {
    content = (
      <span className="inline-block">
        {Array.from(children).map((ch, i) =>
          ch === " " ? (
            <span key={i}>&nbsp;</span>
          ) : (
            <span key={i} className="inline-block overflow-hidden align-bottom">
              <span className="reveal-inner inline-block">{ch}</span>
            </span>
          ),
        )}
      </span>
    );
  }

  // ref typing for any HTML element
  return (
    <Tag ref={ref as React.Ref<HTMLElement>} className={cn(className)}>
      {content}
    </Tag>
  );
}
