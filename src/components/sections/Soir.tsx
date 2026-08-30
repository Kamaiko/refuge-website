"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import BgGradient from "@/components/common/BgGradient";
import RevealText from "@/components/common/RevealText";

/** Ordered top-to-bottom.
 *
 *  ⚠️ These replaced a set of four files — `{feu,terrasse}-{eteint,allume}`
 *  — that existed only to feed a `clip-path` curtain wiping an unlit frame
 *  off a lit one. The curtain was removed in August 2026: the generated
 *  pairs read as flat next to these two, which came from an earlier, more
 *  cinematic pass. With no wipe there is no `before` state to hold, so the
 *  paired type, both `clipPath` constants, the stagger, the `curtainRefs`
 *  array, the reduced-motion branch that retracted them and two
 *  `will-change: clip-path` layers all went with it. The four old AVIFs left
 *  `public/` in the same pass and now sit in
 *  `assets-raw/alternates/medaillon-*-RIDEAU-RETIRE.avif`.
 *
 *  (The folder keeps the section's former name, `Medaillons`; renaming
 *  shipped files buys nothing.) */
const FRAMES = [
  "/images/medaillons/feu.avif",
  "/images/medaillons/rassemblement.avif",
] as const;

/** Parallax travel, in px, for a card. Cards alternate direction so the pair
 *  converges; the text column drifts a third of this against them. */
const CARD_DRIFT = 80;
const TEXT_DRIFT = 28;

/**
 * The evening section. Sits after the Carousel, whose last card is "Le feu de
 * minuit" — so it lands as an amplification: the carousel names the fire as
 * something you can do, this section reveals it's simply a nightly fact of
 * the place. Its job is to open the shared side of the stay without ever
 * turning it into an obligation — hence "qu'il y ait quelqu'un ou non".
 *
 * Two landscape cards parallax *towards each other* on scroll (the top one
 * descends, the bottom one rises). That parallax, and the headline warming
 * with the firelight, are now the section's only motion — the `clip-path`
 * curtain that used to wipe an unlit frame off each card was removed with
 * the frames that fed it.
 *
 * Background: opens on `bg-gris-tan`, continuing the warm band that Activités
 * starts and the Carousel carries — and CLOSES it, fading to base-noir over
 * its own bottom 60%. Feedback below therefore arrives on base-noir already
 * and carries no gradient of its own; it used to own this fade, compressed
 * into its top 45%. Moving it here is what shortens the run of flat gris-tan.
 * ⚠️ The two files are a chain: change the landing colour in one and the other
 * seams visibly.
 *
 * Reduced-motion: no parallax, and the headline stays `creme-dim`.
 */
export default function Soir() {
  const ref = useRef<HTMLDivElement>(null);
  /** The medallion column, used as the headline-warming trigger. Triggering
   *  on the <section> instead is what made the first version unwatchable:
   *  the section starts a long way above the images (it carries
   *  `py-32 md:py-40` plus the whole text column), so the tween had already
   *  run its course while the cards were still near the bottom edge. */
  const mediaColRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  /** The text column, and the first headline beat inside it. Beat 1 is the
   *  one that warms with the fire; see the timeline below. */
  const textColRef = useRef<HTMLDivElement>(null);
  const beat1Ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;

      const mm = gsap.matchMedia();

      // No `reduce` branch: nothing here is hidden at rest any more. The
      // cards render as finished images from the server and the headline
      // starts at its resting colour, so "reduced motion" is simply the
      // absence of the block below.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Parallax. The cards alternate direction so the pair converges as the
        // section crosses the viewport, and the text column drifts against
        // them — noticeable as life, not as movement.
        //
        // All three share ONE timeline, so they cost one ScrollTrigger between
        // them instead of three identical ones. Three meant three sets of
        // per-frame progress bookkeeping and, more importantly, three
        // `getBoundingClientRect` on every `ScrollTrigger.refresh()` — which
        // fires on resize, on font load, and every time a pinned section above
        // re-measures.
        const parallax = gsap.timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });

        cardRefs.current.forEach((card, i) => {
          if (!card) return;
          const dir = i % 2 === 0 ? -1 : 1;
          parallax.fromTo(
            card,
            { y: dir * CARD_DRIFT },
            { y: -dir * CARD_DRIFT, ease: "none", duration: 1 },
            0,
          );
        });

        if (textColRef.current) {
          parallax.fromTo(
            textColRef.current,
            { y: TEXT_DRIFT },
            { y: -TEXT_DRIFT, ease: "none", duration: 1 },
            0,
          );
        }

        // ─── The headline catches the firelight ──────────────────────────
        //
        // The first beat states a warm fact ("Le feu est allumé tous les
        // soirs.") and the second withdraws any obligation from it ("Qu'il y
        // ait quelqu'un ou non."). So only the FIRST warms: the text is lit
        // by the image beside it. The second stays `creme-dim` and is never
        // touched — the difference in treatment is the point, not an
        // oversight.
        //
        // Triggered on the image column, not the section — the headline has
        // to warm while the cards are actually being looked at. The window
        // runs from "the top card has just cleared the lower third of the
        // screen" to "the bottom card is at mid-screen", which is the stretch
        // where both cards are comfortably in view. That's a different
        // trigger element from `parallax` above, which is why this can't fold
        // into it.
        //
        // ⚠️ The ScrollTrigger is declared ON the tween, inside the guard. It
        // used to live on a `gsap.timeline()` created unconditionally above,
        // back when the timeline also carried the two curtain wipes. With
        // those gone it held this single tween, so a null ref would have left
        // a scrubbed, empty ScrollTrigger registered — re-measuring on every
        // `ScrollTrigger.refresh()` (resize, font load, each pinned section
        // above) to produce nothing.
        //
        // Colours are read back from the CSS custom properties rather than
        // written here, so the palette stays single-sourced in globals.css.
        // GSAP needs a concrete value; it can't tween to `var(--x)`.
        if (beat1Ref.current) {
          // One `getComputedStyle` for both reads. It's a forced style flush
          // and this runs inside `useGSAP`, i.e. a layout effect — no reason
          // to pay for it twice.
          const rootStyle = getComputedStyle(document.documentElement);
          const token = (name: string) => rootStyle.getPropertyValue(name).trim();
          gsap.fromTo(
            beat1Ref.current,
            { color: token("--color-creme-dim") },
            {
              color: token("--color-creme"),
              ease: "none",
              scrollTrigger: {
                trigger: mediaColRef.current,
                start: "top 70%",
                // Ends while the column's bottom is still well down the
                // screen, so both cards are settled before they start
                // leaving. A later end (`bottom 55%`) kept the tween running
                // right up to the exit, which reads as unfinished.
                end: "bottom 72%",
                scrub: 1,
              },
            },
          );
        }
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="relative w-full bg-gris-tan px-5 md:px-10 py-32 md:py-40 overflow-hidden"
    >
      {/* The warm band ends HERE, not in Feedback. Activités opens gris-tan,
          the Carousel carries it, and this section used to carry it flat all
          the way down — which meant roughly two and a half screens of
          undiluted gris-tan before anything moved. The fade now starts at 40%
          of this section and lands solid base-noir before its bottom edge, so
          the transition runs over about an entire screen instead of the top
          45% of Feedback. `toAt` guarantees a flat landing colour rather than
          a stop that resolves exactly on the seam, which bands. */}
      <BgGradient
        from="var(--color-gris-tan)"
        to="var(--color-base-noir)"
        direction="down"
        toAt={90}
        className="top-[40%]"
      />

      <div className="relative mx-auto max-w-7xl grid gap-16 md:grid-cols-12 items-center">
        <div
          ref={mediaColRef}
          className="md:col-span-5 relative flex flex-col items-start gap-8 md:gap-10"
        >
          {FRAMES.map((src, i) => (
            <div
              key={src}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className={`relative aspect-[4/3] w-[82%] md:w-[88%] max-w-[440px] rounded-card overflow-hidden bg-base-noir-soft will-change-transform ${
                // The second card is offset right so the pair reads as a
                // staggered column rather than a stack.
                i === 1 ? "self-end" : ""
              }`}
            >
              <Image
                src={src}
                alt=""
                role="presentation"
                fill
                sizes="440px"
                unoptimized
                className="object-cover object-center"
              />
            </div>
          ))}
        </div>

        <div ref={textColRef} className="md:col-span-6 md:col-start-7 will-change-transform">
          <RevealText
            mode="words"
            stagger={0.04}
            duration={0.9}
            className="label-caps text-creme-dim mb-8"
          >
            À la tombée
          </RevealText>

          {/* One semantic <h2>, revealed in two beats via two RevealText
              spans with different `start` offsets — the primitive already
              exposes that knob, no change needed there.
              The split is the point: the first half states a fact about the
              place, the second half removes any obligation from it. Dimming
              the second beat lets it read as an aside rather than a second
              claim. The offsets were tuned to land on the two curtains; with
              those gone they simply space the two beats apart, and the values
              still read well — no reason to retune them. */}
          <h2 className="text-creme text-3xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight">
            {/* Wrapper span exists purely so the colour tween has something
                to hold: RevealText doesn't forward a ref, and `color`
                inherits down to the glyphs anyway. */}
            <span ref={beat1Ref} className="block text-creme-dim">
              <RevealText
                as="span"
                mode="lines"
                stagger={0.12}
                duration={1.2}
                start="top 82%"
                className="block"
              >
                {"Le feu est allumé\ntous les soirs."}
              </RevealText>
            </span>
            <RevealText
              as="span"
              mode="lines"
              stagger={0.12}
              duration={1.2}
              start="top 58%"
              className="block text-creme-dim"
            >
              {"Qu'il y ait\nquelqu'un ou non."}
            </RevealText>
          </h2>

          <RevealText
            mode="lines"
            stagger={0.08}
            delay={0.3}
            start="top 55%"
            className="text-creme-dim mt-10 max-w-md text-base leading-relaxed"
          >
            {"Certains descendent. D'autres regardent la lueur\ndepuis leur terrasse et trouvent que c'est déjà bien."}
          </RevealText>
        </div>
      </div>
    </section>
  );
}
