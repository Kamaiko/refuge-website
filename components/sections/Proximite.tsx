"use client";

import RevealText from "@/components/common/RevealText";
import { useMapOverlay } from "@/components/common/MapOverlayContext";

/**
 * Transition copy block before the `Pourquoi Aquilon ?` marquee.
 * A small eyebrow centered above a large headline; the last clause of
 * the sentence is wrapped in a button (still inside the `<h2>` for
 * semantic completeness) and acts as the trigger that opens the
 * fullscreen Map overlay.
 *
 * Heading semantics — the whole sentence "Nos refuges sont ancrés en
 * Charlevoix, à moins de deux heures de route depuis Québec." lives
 * inside one `<h2>` so screen readers reading by heading hear a
 * complete thought, not "à moins de" followed by a separate
 * un-attached button. The button is a child element of the heading
 * (HTML allows buttons inside headings) and carries its own
 * `aria-label` to make the call-to-action explicit on its own.
 *
 * Underline animation on the button: the bar uses an asymmetric
 * left-to-right wipe — on hover, `transform-origin` snaps to `right`
 * and the bar shrinks to scale-x-0 (left edge sweeps right toward the
 * right anchor); on un-hover, the origin snaps back to `left` and the
 * bar grows back to scale-x-1 (right edge sweeps rightward). Because
 * `transform-origin` itself isn't transitioned, the snap happens while
 * the bar is at scale 0 (invisible), so the motion reads as a
 * continuous left-to-right wipe in both directions.
 *
 * Structural reference: the "Closer than you think" panel from
 * capsules.moyra.co — same composition (centered eyebrow + headline
 * + underlined CTA), original copy adapted to Charlevoix.
 */
export default function Proximite() {
  const { open } = useMapOverlay();

  return (
    <section
      id="proximite"
      className="relative w-full bg-base-noir px-5 md:px-10 py-32 md:py-48 flex flex-col items-center text-center overflow-hidden"
    >
      <RevealText
        as="p"
        mode="words"
        className="text-creme-dim text-lg md:text-2xl font-medium tracking-wide mb-4 md:mb-6"
        stagger={0.05}
        duration={0.9}
      >
        Plus près que vous ne pensez
      </RevealText>

      {/* Single semantic <h2> wrapping the whole sentence. The trailing
          clause is a button with `display: block` so it stacks under
          the static lead-in visually (preserving the design's two-line
          layout) while keeping the heading semantically intact. */}
      <h2 className="max-w-[18ch] md:max-w-[22ch] text-creme text-4xl xs:text-5xl md:text-7xl lg:text-[5.5vw] font-semibold leading-[1.05] tracking-[-0.02em]">
        Nos refuges sont ancrés en Charlevoix, à moins de{" "}
        <button
          type="button"
          onClick={open}
          aria-label="Voir l'emplacement sur la carte — deux heures de route depuis Québec"
          className="group relative mt-3 md:mt-5 block w-fit mx-auto text-creme-terre/70 hover:text-creme transition-colors duration-300 leading-[1.05] tracking-[-0.02em] xs:whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-4 focus-visible:ring-offset-base-noir rounded-sm"
          // Clamp keeps the link readable down to ~360 px viewport
          // (min 1.125rem = 18 px), then scales fluidly with 3vw until
          // it caps at 3rem on very wide screens. Below xs (390 px)
          // wrapping is allowed so the line never overflows the
          // viewport on tiny screens; above xs the `xs:whitespace-nowrap`
          // forces the single-line layout the design asks for.
          style={{ fontSize: "clamp(1.125rem, 3vw, 3rem)" }}
        >
          <span className="relative inline-block pb-1 md:pb-2">
            deux heures de route depuis Québec.
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 right-0 bottom-0 h-[2px] md:h-[3px] bg-creme-terre/70 origin-left scale-x-100 transition-transform duration-500 ease-out group-hover:origin-right group-hover:scale-x-0"
            />
          </span>
        </button>
      </h2>
    </section>
  );
}
