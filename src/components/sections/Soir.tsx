"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import BgGradient from "@/components/common/BgGradient";
import RevealText from "@/components/common/RevealText";

/** One card: the same frame photographed unlit and lit.
 *
 *  Both halves are required. `before` used to be optional, on the theory that
 *  a card could ship ahead of its paired frame — but the section has never
 *  been in that state, nothing on the backlog would put it there, and the
 *  optionality bought a JSX ternary plus a `curtainRefs` array that could
 *  legally contain holes. If a lone frame ever turns up, three lines bring
 *  the branch back. */
type FramePair = {
  /** The revealed state — the fire lit, the lanterns burning. */
  after: string;
  /** The starting state: identical framing, same hour, same objects, but
   *  nothing lit. Must be generated FROM `after` so the two line up exactly
   *  — otherwise the wipe reads as a cut between two places rather than one
   *  place changing. */
  before: string;
};

/** Ordered top-to-bottom. Both get a downward curtain, offset — see
 *  {@link Soir}. (The `medaillons/` asset folder keeps the section's former
 *  name; renaming 4 shipped files buys nothing.)
 *
 *  No people appear in any of these frames, deliberately. The headline says
 *  the fire burns "qu'il y ait quelqu'un ou non", and an empty ring of
 *  chairs around a lit fire states that far more precisely than a couple of
 *  anonymous backs did. The human trace is left in the props instead — a
 *  folded blanket over a chair arm, a table already set. */
const FRAME_PAIRS: readonly FramePair[] = [
  {
    before: "/images/medaillons/feu-eteint.avif",
    after: "/images/medaillons/feu-allume.avif",
  },
  // The private counterpart to the fire above: your own terrace, your own
  // lantern, and the communal fire reduced to a single orange point in the
  // trees below — the second half of the body copy, "D'autres regardent la
  // lueur depuis leur terrasse". In the unlit frame that distant point is
  // gone too, so the wipe lights the near lantern and the far fire at once.
  {
    before: "/images/medaillons/terrasse-eteint.avif",
    after: "/images/medaillons/terrasse-allume.avif",
  },
] as const;

/** The curtain's two states. Hoisted to module scope so the reduced-motion
 *  branch lands on the *same* value the wipe ends at, rather than its own
 *  spelling of "fully retracted" — `inset(0 0 100% 0)` and `inset(100% 0 0 0)`
 *  both hide the layer, but only one of them stays right if the wipe direction
 *  ever changes. */
const WIPE_FROM = { clipPath: "inset(0 0 0% 0)" } as const;
const WIPE_TO = { clipPath: "inset(100% 0 0 0)" } as const;

/** Scroll offset, in timeline units, between one card's wipe and the next.
 *  Enough that the two read as two beats, tight enough that both resolve
 *  inside the trigger window. */
const CURTAIN_STAGGER = 0.6;

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
 * descends, the bottom one rises). On top of that, each card runs a
 * `clip-path` curtain revealing the lit version underneath. Both
 * curtains wipe downward, offset from one another so they still read as the
 * headline's two beats ("Le feu est allumé tous les soirs." / "Qu'il y ait
 * quelqu'un ou non.") without competing.
 *
 * Background: opens on `bg-gris-tan`, continuing the warm band that Activités
 * starts and the Carousel carries — and CLOSES it, fading to base-noir over
 * its own bottom 60%. Feedback below therefore arrives on base-noir already
 * and carries no gradient of its own; it used to own this fade, compressed
 * into its top 45%. Moving it here is what shortens the run of flat gris-tan.
 * ⚠️ The two files are a chain: change the landing colour in one and the other
 * seams visibly.
 *
 * Reduced-motion: no parallax, no curtain. Each card shows its `after` frame
 * at rest — that's the one carrying the meaning, so nothing is lost.
 */
export default function Soir() {
  const ref = useRef<HTMLDivElement>(null);
  /** The medallion column, used as the curtain trigger. Triggering on the
   *  <section> instead is what made the first version unwatchable: the
   *  section starts a long way above the images (it carries `py-32 md:py-40`
   *  plus the whole text column), so the wipe had already run its course
   *  while the cards were still near the bottom edge of the screen. */
  const mediaColRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const curtainRefs = useRef<(HTMLDivElement | null)[]>([]);
  /** The text column, and the first headline beat inside it. Beat 1 is the
   *  one that warms with the fire; see the timeline below. */
  const textColRef = useRef<HTMLDivElement>(null);
  const beat1Ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        // Retract every curtain so the lit frame is what's on screen.
        curtainRefs.current.forEach((el) => {
          if (el) gsap.set(el, WIPE_TO);
        });
      });

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
        // re-measures. Same reasoning as the curtains just below.
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

        // Curtains. One timeline for both so they share a single
        // ScrollTrigger and stay sequenced relative to each other rather
        // than each racing its own scroll range.
        //
        // `ease: "none"` on both: the wipe edge should travel at constant
        // speed. An eased curtain reads as the *image* moving rather than a
        // hard edge passing over it — the same reason the Pourquoi curtain
        // is linear.
        // Triggered on the image column, not the section — the wipe has to
        // happen while the cards are actually being looked at. The window
        // below runs from "the top card has just cleared the lower third of
        // the screen" to "the bottom card is at mid-screen", which is the
        // stretch where both cards are comfortably in view.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: mediaColRef.current,
            start: "top 70%",
            // Ends while the column's bottom is still well down the screen,
            // so both cards are lit and settled before they start leaving.
            // A later end (`bottom 55%`) kept the wipe running right up to
            // the exit, which reads as unfinished.
            end: "bottom 72%",
            scrub: 1,
          },
        });

        // Both curtains wipe in the SAME direction — the unlit layer is cut
        // away from its top edge, so the revealing edge travels downward on
        // each card. They were originally mirrored (one down, one up) to
        // echo the converging parallax, but two edges moving against each
        // other reads as busy at this size; a single shared direction is
        // calmer and lets the eye follow one movement down the column.
        //
        // Offset rather than sequenced — see CURTAIN_STAGGER.
        curtainRefs.current.forEach((curtain, i) => {
          if (!curtain) return;
          tl.fromTo(
            curtain,
            WIPE_FROM,
            { ...WIPE_TO, ease: "none", duration: 1 },
            i * CURTAIN_STAGGER,
          );
        });

        // ─── The headline catches the firelight ──────────────────────────
        //
        // The first beat states a warm fact ("Le feu est allumé tous les
        // soirs.") and the second withdraws any obligation from it ("Qu'il y
        // ait quelqu'un ou non."). So only the FIRST warms, on the same
        // scrub as the fire lighting: the text is lit by the image beside
        // it. The second stays `creme-dim` and is never touched — the
        // difference in treatment is the point, not an oversight.
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
          tl.fromTo(
            beat1Ref.current,
            { color: token("--color-creme-dim") },
            { color: token("--color-creme"), ease: "none", duration: 1 },
            0,
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
          {FRAME_PAIRS.map((m, i) => (
            <div
              key={m.after}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className={`relative aspect-[4/3] w-[82%] md:w-[88%] max-w-[440px] rounded-card overflow-hidden bg-base-noir-soft will-change-transform ${
                // The second card is offset right so the pair reads as a
                // staggered column rather than a stack.
                i === 1 ? "self-end" : ""
              }`}
            >
              {/* Revealed layer, underneath. */}
              <Image
                src={m.after}
                alt=""
                role="presentation"
                fill
                sizes="440px"
                unoptimized
                className="object-cover object-center"
              />

              {/* Covering layer + curtain. `will-change: clip-path` because
                  that's the animated property here, not transform. */}
              <div
                ref={(el) => {
                  curtainRefs.current[i] = el;
                }}
                className="absolute inset-0 [will-change:clip-path]"
              >
                <Image
                  src={m.before}
                  alt=""
                  role="presentation"
                  fill
                  sizes="440px"
                  unoptimized
                  className="object-cover object-center"
                />
              </div>
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
              claim. The offsets are tuned to land on the two curtains. */}
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
