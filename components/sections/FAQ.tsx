"use client";

import { useState } from "react";
import { FAQ } from "@/lib/data/faq";
import RevealText from "@/components/common/RevealText";
import RevealOnScroll from "@/components/common/RevealOnScroll";

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative w-full px-5 md:px-10 py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 max-w-3xl">
          <RevealText
            mode="words"
            stagger={0.04}
            className="text-creme-dim text-xs uppercase tracking-[0.3em] mb-8"
          >
            Questions
          </RevealText>

          <RevealText
            as="h2"
            mode="lines"
            className="text-creme text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight"
          >
            Avant de venir.
          </RevealText>
        </div>

        <RevealOnScroll y={20} stagger={0.06}>
          <ul className="border-t border-creme/10">
            {FAQ.map((item, i) => {
              const isOpen = open === i;
              return (
                <li key={i} className="border-b border-creme/10">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors hover:text-creme/90"
                    aria-expanded={isOpen}
                  >
                    <span className="text-creme text-lg md:text-xl font-medium tracking-tight">
                      {item.question}
                    </span>
                    <span
                      className={`relative h-6 w-6 shrink-0 rounded-full border border-creme/30 transition-transform duration-500 ease-out ${
                        isOpen ? "rotate-45" : ""
                      }`}
                      aria-hidden
                    >
                      <span className="absolute left-1/2 top-1/2 block h-px w-2.5 -translate-x-1/2 -translate-y-1/2 bg-creme" />
                      <span className="absolute left-1/2 top-1/2 block h-2.5 w-px -translate-x-1/2 -translate-y-1/2 bg-creme" />
                    </span>
                  </button>
                  <div
                    className={`grid overflow-hidden transition-[grid-template-rows] duration-500 ease-out ${
                      isOpen ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-creme-dim max-w-2xl text-base leading-relaxed">
                        {item.reponse}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </RevealOnScroll>
      </div>
    </section>
  );
}
