"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

type RevealMode = "lines" | "words";

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
 *
 * For per-character right→left wipe (used by Capsules), see RevealChars.
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
      const targets = el.querySelectorAll<HTMLElement>(".reveal-inner");
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
    },
    { scope: ref, dependencies: [children, mode] },
  );

  let content: ReactNode;
  if (mode === "lines") {
    const lines = children.split("\n");
    content = lines.map((line, i) => (
      <span key={i} className="block overflow-hidden">
        <span className="reveal-inner block">{line || " "}</span>
      </span>
    ));
  } else {
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
  }

  return (
    <Tag ref={ref as React.Ref<HTMLElement>} className={className}>
      {content}
    </Tag>
  );
}
