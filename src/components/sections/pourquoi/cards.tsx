"use client";

import Image from "next/image";
import RevealChars from "@/components/common/RevealChars";
import SlideIndicators from "@/components/common/SlideIndicators";
import { TEXT_REVEAL, TEXT_SWAP_DELAY_MS } from "./slides";

/**
 * The presentational pieces of the Pourquoi carousel.
 *
 * They carry no scroll logic at all — every ref, timeline and wheel handler
 * lives in `Pourquoi.tsx`. Split out because that file had grown to six
 * components and 620 lines, which made the part that's actually intricate (the
 * wheel-hijacked timeline) hard to find among the parts that aren't.
 */

/** Absolutely-positioned half-width card slot. Width `calc(50% - 1.125rem)` —
 *  half the section minus 18px, which combined with the 12px outer inset and
 *  the 12px centre gap balances to a clean 12px gutter throughout. */
export function CardSlot({
  side,
  zClass,
  children,
  ref,
}: {
  side: "left" | "right";
  zClass: string;
  children: React.ReactNode;
  ref: React.Ref<HTMLDivElement>;
}) {
  const xClass = side === "left" ? "left-3" : "right-3";
  return (
    <div
      ref={ref}
      className={`absolute top-3 bottom-3 w-[calc(50%-1.125rem)] ${xClass} ${zClass} will-change-transform`}
    >
      {children}
    </div>
  );
}

/** Outer card body — the gris-tan rounded box with its overflow clip. Holds
 *  one or more {@link CardText} layers; only this wrapper carries the
 *  background so stacked text layers don't paint over each other. Corners
 *  match the Hebergements cards. */
export function CardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-full w-full bg-gris-tan rounded-frame md:rounded-hero overflow-hidden">
      {children}
    </div>
  );
}

/** Rounded image-card frame — same corner radius as {@link CardWrapper}, no
 *  background. Wraps the absolute image layers so the corners clip them. */
export function RoundedFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 rounded-frame md:rounded-hero overflow-hidden">
      {children}
    </div>
  );
}

/** Single full-bleed image inside a slide's frame.
 *
 *  `unoptimized` because the source AVIFs are already encoded at the right
 *  size — Next's re-encode at quality 75 would only soften them.
 *
 *  This used to expose `scale` and `objectPosition` knobs. No call site ever
 *  passed either, and the `scale` default was `1` — so every slide emitted an
 *  inline `transform: scale(1)`. The photos are framed 4:5 for the portrait
 *  card and need no crop correction; the only real zoom in the section is the
 *  GSAP dolly, which owns `imageCardA`'s transform directly. */
export function SlideImage({
  src,
  alt = "",
}: {
  src: string;
  /** Defaults to empty so the layered image stacks used during a slide
   *  transition don't all announce themselves to screen readers. Pass a real
   *  label on the foreground image only. */
  alt?: string;
}) {
  return (
    <Image src={src} alt={alt} fill sizes="50vw" unoptimized className="object-cover" />
  );
}

/** Text content layer — title top-left (large), pagination bottom-left,
 *  secondary copy bottom-right. The RevealChars sweep is driven by `active`.
 *  `stacked` lets two layers overlap inside one {@link CardWrapper}, which is
 *  how textCardB swaps text-2 ↔ text-3 sequentially. */
export function CardText({
  title,
  body,
  active,
  index,
  total,
  stacked = false,
}: {
  title: string;
  body: string;
  active: boolean;
  index: number;
  total: number;
  stacked?: boolean;
}) {
  // Hide the inactive layer entirely — prevents per-glyph mask sub-pixel leak
  // from bleeding through. The fade-out must not start before the RevealChars
  // reverse-out has finished, or the glyphs dissolve while still sliding.
  // `TEXT_SWAP_DELAY_MS` *is* that reverse-out duration for the longest title,
  // so reusing it lands the fade exactly on the last frame of the slide-out —
  // and it re-derives itself if the copy or the TEXT_REVEAL settings change.
  return (
    <div
      style={{ transitionDelay: active ? "0ms" : `${TEXT_SWAP_DELAY_MS}ms` }}
      className={`${stacked ? "absolute" : "relative"} inset-0 h-full w-full p-10 md:p-14 lg:p-16 flex flex-col justify-between gap-8 transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <RevealChars
        text={title}
        play={active}
        duration={TEXT_REVEAL.duration}
        stagger={TEXT_REVEAL.titleStagger}
        className="block text-creme-terre/85 text-3xl xs:text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.05] tracking-tight"
      />

      {/* Symmetric inset on the bottom row keeps both ends clear of the fixed
          Menu pill at viewport bottom-centre AND keeps the rhythm consistent
          card-to-card — every card gets the same horizontal breathing room,
          whichever side it sits on. */}
      <div className="flex items-end justify-between gap-6 px-12 md:px-16 lg:px-20">
        <SlideIndicators
          current={index}
          total={total}
          active={active}
          shiftLeft={index !== 2}
        />
        <div className="text-creme text-xl md:text-2xl leading-snug max-w-lg text-right font-semibold">
          <RevealChars
            text={body}
            play={active}
            duration={TEXT_REVEAL.duration}
            delay={TEXT_REVEAL.bodyDelay}
            stagger={TEXT_REVEAL.bodyStagger}
          />
        </div>
      </div>
    </div>
  );
}
