"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import RevealText from "@/components/common/RevealText";

/** One medallion's imagery.
 *
 *  `before` is optional. When it's present the card becomes a two-layer
 *  frame and a scroll-driven curtain wipes `before` away to reveal `after`;
 *  when it's absent the card is a plain single image and only the parallax
 *  applies. That lets a medallion ship before its paired frame exists
 *  instead of blocking the whole section on a full set of images. */
type Medallion = {
  /** The revealed state — the fire lit, the lanterns burning. Required. */
  after: string;
  /** The starting state: identical framing, same hour, same objects, but
   *  nothing lit. Must be generated FROM `after` so the two line up exactly
   *  — otherwise the wipe reads as a cut between two places rather than one
   *  place changing. */
  before?: string;
};

/** Ordered top-to-bottom. The first entry gets the downward curtain, the
 *  second the upward one — see {@link Medaillons}.
 *
 *  No people appear in any of these frames, deliberately. The headline says
 *  the fire burns "qu'il y ait quelqu'un ou non", and an empty ring of
 *  chairs around a lit fire states that far more precisely than a couple of
 *  anonymous backs did. The human trace is left in the props instead — a
 *  folded blanket over a chair arm, a table already set. */
const MEDALLIONS: readonly Medallion[] = [
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

/**
 * The day→evening hinge of the page, between Pourquoi (which ends on the
 * distance between refuges) and Activités (which opens on "Seul, ou tous
 * ensemble"). Its job is to introduce the shared side of the stay without
 * ever turning it into an obligation — hence "qu'il y ait quelqu'un ou non".
 *
 * Two landscape medallion cards parallax *towards each other* on scroll (the
 * top one descends, the bottom one rises). On top of that, each card that has
 * a paired frame runs a `clip-path` curtain revealing the lit version
 * underneath. Both curtains wipe downward, offset from one another so they
 * still read as the headline's two beats ("Le feu est allumé tous les
 * soirs." / "Qu'il y ait quelqu'un ou non.") without competing.
 *
 * Reduced-motion: no parallax, no curtain. Each card shows its `after` frame
 * at rest — that's the one carrying the meaning, so nothing is lost.
 */
export default function Medaillons() {
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
          if (el) gsap.set(el, { clipPath: "inset(0 0 100% 0)" });
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const [card1, card2] = cardRefs.current;
        const [curtain1, curtain2] = curtainRefs.current;

        // Parallax — unchanged. The top card descends and the bottom one
        // rises, so the pair converges as the section crosses the viewport.
        const parallax = {
          ease: "none" as const,
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        };
        if (card1) gsap.fromTo(card1, { y: -80 }, { y: 80, ...parallax });
        if (card2) gsap.fromTo(card2, { y: 80 }, { y: -80, ...parallax });

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
        const wipeDown = {
          from: { clipPath: "inset(0 0 0% 0)" },
          to: { clipPath: "inset(100% 0 0 0)", ease: "none", duration: 1 },
        };

        if (curtain1) tl.fromTo(curtain1, wipeDown.from, wipeDown.to, 0);
        // Offset rather than sequenced: enough delay that the two still read
        // as two beats, tight enough that both resolve inside the window.
        if (curtain2) tl.fromTo(curtain2, wipeDown.from, wipeDown.to, 0.6);

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
          const token = (name: string) =>
            getComputedStyle(document.documentElement)
              .getPropertyValue(name)
              .trim();
          tl.fromTo(
            beat1Ref.current,
            { color: token("--color-creme-dim") },
            { color: token("--color-creme"), ease: "none", duration: 1 },
            0,
          );
        }

        // Slow counter-drift on the text column. The two medallions converge
        // (top descends, bottom rises); the text rising against them keeps
        // the composition breathing instead of locking into one direction.
        // Deliberately a third of the medallions' travel — noticeable as
        // life, not as movement.
        if (textColRef.current) {
          gsap.fromTo(
            textColRef.current,
            { y: 28 },
            { y: -28, ...parallax },
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
      className="relative w-full px-5 md:px-10 py-32 md:py-40 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl grid gap-16 md:grid-cols-12 items-center">
        <div
          ref={mediaColRef}
          className="md:col-span-5 relative flex flex-col items-start gap-8 md:gap-10"
        >
          {MEDALLIONS.map((m, i) => (
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
                className="object-cover object-center"
              />

              {/* Covering layer + curtain. Only rendered when a paired frame
                  exists; `will-change: clip-path` because that's the animated
                  property here, not transform. */}
              {m.before ? (
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
                    className="object-cover object-center"
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div ref={textColRef} className="md:col-span-6 md:col-start-7 will-change-transform">
          <RevealText
            mode="words"
            stagger={0.04}
            duration={0.9}
            className="eyebrow text-creme-dim mb-8"
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
