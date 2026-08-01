"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SITE_CONFIG } from "@/lib/constants";
import BgGradient from "@/components/common/BgGradient";

const EYEBROW = "Et eux, qu'en pensent-ils ?";
const QUOTE = `Un séjour à ${SITE_CONFIG.brandMark} au Québec a redéfini ce que repos veut dire — le design moderne se mêle à la nature, et chaque coucher de soleil ressemble à un tableau suspendu.`;

/**
 * Closing testimonial section. Three blocks (eyebrow, quote, author) are
 * revealed **per word** as the section scrolls into view.
 *
 * Effect ("voilement") : each word sits inside its own mask, starts below
 * the mask offset (yPercent: 110), invisible (opacity: 0) and blurred
 * (filter: blur). All three properties scrub-tween together as the section
 * progresses through the viewport, with a per-word stagger that produces
 * a wave-like reveal — words don't all rise at once, they cascade.
 *
 * The reveal scrubs IN BOTH DIRECTIONS — scrolling back up makes the
 * words sink, blur out and fade away in reverse. Reduced-motion paints
 * the final state with no animation.
 */
export default function Feedback() {
  const sectionRef = useRef<HTMLElement>(null);
  const authorRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const words = section.querySelectorAll<HTMLElement>(".voile-word");
      const author = authorRef.current;

      const mm = gsap.matchMedia();
      // Desktop + mobile share the same easing/scrub but mobile fires
      // the trigger earlier — on phones the section enters the viewport
      // and is mostly visible before the desktop `top 50%` window opens,
      // leaving the words held off-screen for an awkwardly long beat.
      // Pulling start up to `top 85%` lets the reveal begin as the
      // section header just clears the fold.
      const setup = ({ start, end }: { start: string; end: string }) => {
        if (!words.length) return;

        gsap.set(words, {
          yPercent: 110,
          opacity: 0,
          filter: "blur(6px)",
        });
        if (author) gsap.set(author, { opacity: 0, y: 20 });

        gsap.to(words, {
          yPercent: 0,
          opacity: 1,
          filter: "blur(0px)",
          ease: "none",
          stagger: { each: 0.09, from: "start" },
          scrollTrigger: {
            trigger: section,
            start,
            end,
            scrub: 1.4,
          },
        });

        if (author) {
          gsap.to(author, {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: author,
              start: "top 95%",
              end: "top 70%",
              scrub: 0.5,
            },
          });
        }
      };

      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
        setup({ start: "top 50%", end: "center 60%" });
      });
      mm.add("(prefers-reduced-motion: no-preference) and (max-width: 767px)", () => {
        setup({ start: "top 85%", end: "center 70%" });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(words, { yPercent: 0, opacity: 1, filter: "blur(0px)" });
        if (author) gsap.set(author, { opacity: 1, y: 0 });
      });

      return () => {
        mm.revert();
        ScrollTrigger.getAll().forEach((t) => {
          if (t.trigger === section || t.trigger === author) t.kill();
        });
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="feedback"
      className="relative w-full px-8 md:px-16 pt-16 md:pt-24 pb-20 md:pb-48 flex flex-col"
    >
      {/* Symmetric counterpart to the Activités base-noir → gris-tan
          fade. The top 45% of Feedback runs gris-tan → base-noir so
          the carousel's warm bg melts smoothly back into the rest of
          the page's pure black. Bumped from the original 25% — the
          shorter band read as a too-sharp seam at the section
          boundary; 45% lets the eye drift through the transition
          rather than catching the edge. */}
      <BgGradient
        from="var(--color-gris-tan)"
        to="var(--color-base-noir)"
        direction="down"
        className="bottom-[55%]"
      />

      {/* Eyebrow — top-left. Acts as the section's semantic title. */}
      <h2 className="text-creme text-lg md:text-xl font-semibold tracking-tight m-0">
        <WordSplit text={EYEBROW} />
      </h2>

      {/* Quote — large, left-aligned, capped at ~75% of viewport width with
          a tighter leading. Smaller display size than the original 5.5vw so
          the quote reads as one calm block instead of dominating. */}
      <div className="flex-1 flex items-center mt-16 md:mt-24">
        <p className="text-creme text-2xl xs:text-3xl md:text-4xl lg:text-[3.8vw] font-light leading-snug tracking-[-0.02em] max-w-[75vw]">
          <WordSplit text={QUOTE} />
        </p>
      </div>

      {/* Author — bottom-left, avatar + name + location */}
      <div ref={authorRef} className="flex items-center gap-4 mt-12 will-change-transform">
        <Image
          src="/images/PhotoPat.jpg"
          alt="Patrick Patenaude"
          width={96}
          height={96}
          className="h-12 w-12 rounded-full object-cover shrink-0"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-creme text-sm">Patrick P.</span>
          <span className="text-gris-secondaire text-sm">(Sorel)</span>
        </div>
      </div>
    </section>
  );
}

/** Splits `text` on whitespace and wraps each word in a `(mask, inner)`
 *  pair so per-word transforms / opacity / blur can be tweened without
 *  affecting word spacing or line wrapping.
 *
 *  - Outer span (`overflow-hidden`, `align-bottom`): the mask. Width
 *    follows its content, baseline anchored to bottom so the inner word
 *    sliding from below appears to rise out of the line itself.
 *  - Inner span (`.voile-word`): the GSAP target. `will-change` opts it
 *    into a compositor layer so blur + transform updates don't repaint
 *    the surrounding text. */
function WordSplit({ text }: { text: string }) {
  const tokens = text.split(/(\s+)/);
  return (
    <span aria-label={text}>
      {tokens.map((token, i) =>
        /^\s+$/.test(token) ? (
          <span key={i} aria-hidden>
            {token}
          </span>
        ) : (
          <span
            key={i}
            aria-hidden
            className="inline-block overflow-hidden align-bottom"
          >
            <span className="voile-word inline-block will-change-[transform,filter,opacity]">
              {token}
            </span>
          </span>
        ),
      )}
    </span>
  );
}
