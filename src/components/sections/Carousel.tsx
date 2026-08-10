"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { MQ } from "@/lib/breakpoints";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import SlideIndicators from "@/components/common/SlideIndicators";

type Card = {
  titre: string;
  sous: string;
  niveau: string;
  image: string;
  /** Per-card image scale. The activity photos are framed for this
   *  card's landscape aspect ratio, so `1` is the norm — they read
   *  correctly without a crop. A higher value is only needed if a
   *  given asset has dead edges to trim. The desktop parallax pan
   *  relies on at least `PARALLAX_SCALE_FLOOR` so the
   *  +`PARALLAX_X_PERCENT` % x-translation doesn't expose empty
   *  pixels — values below the floor are clamped at the call site. */
  zoom: number;
  /** Optional CSS `object-position` for the underlying `<Image>`.
   *  Lets a single card crop off-center (e.g., to push the subject
   *  out of a corner the title would otherwise obscure). Defaults to
   *  `"50% 50%"` when omitted. */
  objectPosition?: string;
};

/** Inner-pan parallax constants. Bound together because the floor is
 *  the minimum scale needed to absorb the x-translation without
 *  exposing empty pixels at the trailing edge — change one, audit the
 *  other. */
const PARALLAX_SCALE_FLOOR = 1.15;
const PARALLAX_X_PERCENT = 8;

/** The five activity cards. Photos are framed for the card's landscape
 *  aspect ratio (3:2 source, object-cover crop), so `zoom` stays at 1 —
 *  the desktop parallax floor (`PARALLAX_SCALE_FLOOR`) is applied at the
 *  call site. Four of the five sit in the "solitude" register and only the
 *  last one ("Le feu de minuit") in the "rassemblement" one; the Activités
 *  intro above frames the duality. Under the site's editorial rule — the
 *  refuge is private, the territory is shared — the shared side is
 *  deliberately the minority.
 *  Image paths point at the final AVIFs in /images. */
const CARDS: readonly Card[] = [
  {
    titre: "Kayak sur le fjord",
    sous: "Glisser au ras de l'eau, sous une lumière qui change toutes les dix minutes.",
    niveau: "Journée",
    image: "/images/activites/kayak.avif",
    zoom: 1,
  },
  {
    titre: "Randonnée des sommets",
    sous: "Monter une heure pour mériter l'horizon. En haut, le monde se tait.",
    niveau: "Journée",
    image: "/images/activites/sommet.avif",
    zoom: 1,
  },
  {
    titre: "Via ferrata",
    sous: "Suspendu à la roche, le vide sous les pieds — et le calme, étrangement, qui s'installe.",
    niveau: "Demi-journée",
    image: "/images/activites/via-ferrata.avif",
    zoom: 1,
    // The climber sits in the right third of the 3:2 source; bias the
    // object-position right so the 4:3 card crop keeps them in frame.
    objectPosition: "62% 50%",
  },
  {
    // Replaced "Terrasse en fête", which was the last remnant of the
    // festival register the site dropped everywhere else — and its photo
    // showed a smartly-dressed crowd, reading as an event rather than as
    // the territory. Belugas were already seeded in the copy: the Galets
    // refuge description says "Les bélugas passent l'été, parfois".
    titre: "Le passage des bélugas",
    sous: "Une heure à fixer l'eau grise pour trois secondes de dos blanc. Personne ne s'en est jamais plaint.",
    niveau: "Après-midi",
    image: "/images/activites/belugas.avif",
    zoom: 1,
  },
  {
    titre: "Le feu de minuit",
    sous: "La nuit tombe, le feu prend. On reste tard, verre à la main, à refaire le monde.",
    niveau: "Soirée",
    image: "/images/activites/veillee.avif",
    zoom: 1,
  },
] as const;

/**
 * Horizontal pinned scroll-scrub carousel. The section pins for ~3
 * viewports on desktop; during the pin the vertical scroll progress maps
 * linearly onto an `xPercent` translation of the track. Two of the three
 * cards (indexes 1 and 2) carry an extra scrub-tied **internal pan** —
 * their image translates a few percent to the left as the track itself
 * pans, so each frame layers two motion axes for parallax depth.
 *
 * Lenis + scrub coexist cleanly (Hebergements proves this), so the
 * section-lock event is NOT dispatched — the section-lock is needed only
 * for the wheel-hijack flow in Pourquoi.
 *
 * Mobile + reduced-motion : drop pin entirely, render the 3 cards in a
 * vertical stack.
 */
export default function Carousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const innerPanRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Layout switch, not an animation parameter — see the JSX below. The
  // desktop track is driven entirely by ScrollTrigger, so under reduced
  // motion it must not render at all: the pin never engages and cards 1
  // through 4 would sit permanently off-screen with no way to reach them.
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: `(prefers-reduced-motion: no-preference) and ${MQ.mdUp}`,
        },
        (ctx) => {
          const { isDesktop } = ctx.conditions as { isDesktop: boolean };
          if (!isDesktop) return; // mobile uses the vertical stack JSX below

          // Track layout : 5 cards at 75vw each = 375vw total.
          // At rest (xPercent: 0), card 0 occupies 0–75vw of viewport
          // and card 1 peeks on the right (75–100vw). At the end of
          // the active phase, the LAST card (index 4) occupies 25–100vw
          // and card 3 peeks on the left (0–25vw). The last card's left
          // edge sits at (N-1)·75 = 300vw in the track and we want it at
          // 25vw on screen → translate = 25 - 300 = -275vw = -73.3333%
          // of the 375vw-wide track.
          const TRACK_END_PERCENT = -73.3333;

          // Single timeline so the track translation and the inner
          // pans share one ScrollTrigger (no duplicates competing
          // for the same scroll range). Three phases :
          //
          //   ┌ HOLD_START ┬────── ACTIVE ──────┬─ HOLD_END ─┐
          //   0        0.03                 0.95          1.0
          //
          // HOLD_START is small (0.03) so motion starts almost
          // immediately after the pin grabs — leaves no idle frames
          // where the user feels momentum stall against a frozen
          // timeline. HOLD_END is a small exit cushion so a fast
          // scroll past doesn't snap the pin release.
          //
          // No `anticipatePin` — it overwrites Lenis' in-flight
          // momentum tween via an internal `scrollTo`, producing a
          // visible vertical snap at pin engagement. Hebergements
          // uses the same pin+scrub pattern without it.
          const HOLD_START = 0.03;
          const ACTIVE = 0.92;
          const HOLD_END = 0.05;

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              // 5 cards travel -275vw (vs -125vw for 3). Scaled from the
              // old +=350% to preserve the same scrub feel per vw of
              // travel: 350 × 275/125 = 770. Tune down if the pin feels
              // too long (it's a 7.7-viewport pin).
              end: "+=770%",
              pin: true,
              // Scrub adds inertia lag at scroll start/stop. 0.8 keeps the
              // "takes a beat to start" feel but a touch snappier than 1.
              scrub: 0.8,
            },
          });

          tl.fromTo(
            track,
            { xPercent: 0 },
            // power1.inOut (gentler than power2) lowers the mid-scroll peak
            // velocity so the carousel doesn't lurch fast in the middle —
            // still eases in/out for a soft start and smooth finish.
            { xPercent: TRACK_END_PERCENT, ease: "power1.inOut", duration: ACTIVE },
            HOLD_START,
          );

          // Per-card setup + inner-pan parallax. Scale is set via GSAP
          // (not inline style) so GSAP's transform composes with the
          // animated `xPercent` instead of being overwritten. The
          // `PARALLAX_SCALE_FLOOR` clamp absorbs the +x translation
          // without exposing empty edges; cards with a higher zoom
          // just use their own value. The +x is applied to every card
          // (including card 0) so the parallax direction stays uniform.
          CARDS.forEach((c, i) => {
            const el = innerPanRefs.current[i];
            if (!el) return;
            const scale = Math.max(c.zoom, PARALLAX_SCALE_FLOOR);
            gsap.set(el, { scale, transformOrigin: "center" });
            tl.fromTo(
              el,
              { xPercent: 0 },
              { xPercent: PARALLAX_X_PERCENT, ease: "power1.inOut", duration: ACTIVE },
              HOLD_START,
            );
          });

          // No-op tween extends timeline.duration() to 1.0 so scrub
          // reserves HOLD_END at the tail. Without it, the timeline
          // would end at HOLD_START + ACTIVE = 0.82 and the pin would
          // release with 0.18 of scroll "missing".
          tl.to({}, { duration: HOLD_END });
        },
      );

      return () => {
        mm.revert();
        // Belt-and-braces : mm.revert kills the triggers it created, but
        // an explicit kill on the section's ScrollTriggers handles edge
        // cases where matchMedia re-fires during a fast resize.
        ScrollTrigger.getAll().forEach((t) => {
          if (t.trigger === section) t.kill();
        });
      };
    },
    { scope: sectionRef },
  );

  return (
    // `z-[95]` lifts the section above the floating "Concept · 2026"
    // badge (z-[90]) during the pin, so the rounded right-corner of
    // the LAST card paints in front of the badge instead of being
    // obscured by it. `bg-gris-tan` continues the warm band started
    // halfway through Activités above; Feedback below snaps back to
    // bg-base-noir at the section boundary.
    <section
      ref={sectionRef}
      aria-labelledby="carousel-heading"
      className="relative w-full bg-gris-tan overflow-hidden z-[95]"
    >
      {/* The visible heading for this content lives in Activités, one
          section up ("Découvrez les activités du territoire"). This is a
          separate <section> element though, so it needs its own accessible
          name — and without it the <h3> card titles below are orphans with
          no <h2> anywhere in the section. */}
      <h2 id="carousel-heading" className="sr-only">
        Les activités du territoire, en images
      </h2>

      {/* Mobile : horizontal thumb-swipe scroll. The pin / scrub doesn't
          apply below md, but we still want the carousel feeling — so the
          3 cards live in a horizontal overflow-x track with snap-mandatory.
          Card layout : image (with niveau pill + indicators overlay) on
          top, title + body below in plain text — keeps the photo as the
          primary anchor and offloads body text into legible vertical
          rhythm. `w-[85vw]` lets the edge of the next card peek on the
          right, hinting at swipeability. */}
      <div className={`${prefersReducedMotion ? "block" : "md:hidden"} py-16`}>
        <div className="overflow-x-auto snap-x snap-mandatory flex gap-4 px-3 no-scrollbar">
          {CARDS.map((c, i) => (
            // `md:w-[42vw]` only ever applies when this block is standing in
            // for the desktop track (reduced motion) — 85vw cards on a
            // 1440px screen would be absurd. On real mobile the md: prefix
            // never matches.
            <article
              key={c.titre}
              className="snap-center shrink-0 w-[85vw] md:w-[42vw] flex flex-col gap-5"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card">
                <Image
                  src={c.image}
                  alt={c.titre}
                  fill
                  sizes="85vw"
                  unoptimized
                  className="object-cover"
                  // Mobile has no parallax pan, so the scale floor isn't
                  // required — apply the per-card zoom directly. `1` is a
                  // no-op for cards framed for this aspect ratio.
                  // `objectPosition` is optional; falls back to centered
                  // when omitted on the card.
                  style={{
                    transform: `scale(${c.zoom})`,
                    objectPosition: c.objectPosition,
                  }}
                />
                {/* Niveau pill — overlay top-right of the image */}
                <span className="absolute top-4 right-4 inline-flex items-center rounded-pill border border-creme/40 bg-base-noir/30 backdrop-blur-sm px-4 py-1.5 text-xs font-medium tracking-wide text-creme">
                  {c.niveau}
                </span>
                {/* Indicators — overlay bottom-left of the image */}
                <div className="absolute bottom-2 left-2">
                  <SlideIndicators
                    current={i + 1}
                    total={CARDS.length}
                    active
                    tone="strong"
                  />
                </div>
              </div>
              <h3 className="text-creme text-3xl font-medium leading-tight tracking-tight">
                {c.titre}
              </h3>
              <p className="text-creme-terre/70 text-base leading-snug">
                {c.sous}
              </p>
            </article>
          ))}
        </div>
      </div>

      {/* Desktop : pinned horizontal track. The track holds 5 cards of
          75vw each (total 375vw); ScrollTrigger maps vertical scroll
          progress to xPercent. 75vw per card produces a side-peek of
          the next/previous card at every position — one card occupies
          the centre with adjacent cards visible at ~25vw width on
          each side. */}
      <div className={prefersReducedMotion ? "hidden" : "hidden md:block"}>
        <div className="h-screen flex items-center">
          <div
            ref={trackRef}
            className="flex w-[375vw] gap-0 will-change-transform"
          >
            {CARDS.map((c, i) => (
              // p-3 (12px) tight inset matching the gap between cards
              // in the Pourquoi section (also ~12px). Adjacent card
              // wrappers contribute 12px each, producing a 24px black
              // gap between rounded card edges — tight enough to feel
              // grouped, loose enough that the rounded corners read
              // as distinct shapes. The section's `z-[95]` lifts the
              // article in front of the floating badge so the rounded
              // right-corner of the LAST card stays fully visible.
              <div key={c.titre} className="w-[75vw] h-screen p-3 flex-shrink-0">
                {/* Triple-fix for the rounded-clip-with-transformed-
                    children bug in Chromium/WebKit :
                    1. `overflow-hidden` + `rounded-hero` — the
                       baseline that works in most cases.
                    2. `clipPath: inset(0 round 60px)` — fallback for
                       browsers where overflow+radius doesn't clip
                       transformed children correctly.
                    3. `transform: translateZ(0)` — promotes the
                       article to its own compositor layer, which is
                       what consistently fixes the residual cases
                       where the right-edge corner of the LAST card
                       stays sharp behind the inner-pan's `scale(1.08)`
                       transform. Without this, some Chromium builds
                       still skip the rounded clip on transformed
                       descendants. */}
                <article
                  className="relative h-full w-full overflow-hidden rounded-hero"
                  style={{
                    clipPath: "inset(0 round 60px)",
                    transform: "translateZ(0)",
                  }}
                >
                  {/* Inner pan wrapper. Scaled 1.08x via gsap.set() in
                      the useGSAP block so a few percent of x-translation
                      never reveals empty pixels at the trailing edge.
                      The scale isn't inlined here because GSAP needs to
                      own the transform when xPercent is also animated
                      on the same element — mixing inline + GSAP
                      transforms drops the scale at tween start. */}
                  <div
                    ref={(el) => {
                      innerPanRefs.current[i] = el;
                    }}
                    className="absolute inset-0 will-change-transform"
                  >
                    <Image
                      src={c.image}
                      alt={c.titre}
                      fill
                      sizes="100vw"
                      unoptimized
                      className="object-cover"
                      style={{ objectPosition: c.objectPosition }}
                    />
                  </div>
                  <CardOverlay card={c} index={i} total={CARDS.length} />
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Per-card overlay : title top-left, difficulty pill top-right,
 *  subtitle bottom-left, page indicator bottom-right. Same composition
 *  on mobile and desktop, with slightly tighter padding on mobile. */
function CardOverlay({
  card,
  index,
  total,
  mobile = false,
}: {
  card: Card;
  index: number;
  total: number;
  mobile?: boolean;
}) {
  return (
    <>
      {/* Top + bottom darkening for legibility over the photo. Mid-band
          stays clear so the subject of the image keeps its full presence.
          Painted BEFORE the text in DOM so it sits behind the overlay. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(24,23,23,0.45) 0%, rgba(24,23,23,0) 22%, rgba(24,23,23,0) 70%, rgba(24,23,23,0.55) 100%)",
        }}
      />

      <div
        className={`absolute inset-0 pointer-events-none ${
          mobile ? "p-6" : "p-12 lg:p-16"
        } flex flex-col justify-between`}
      >
        <div className="flex items-start justify-between gap-4">
          <h3
            className={`text-creme font-medium leading-[1] tracking-tight ${
              mobile
                ? "text-3xl xs:text-4xl max-w-[70%]"
                : "text-5xl lg:text-6xl max-w-[55%]"
            }`}
          >
            {card.titre}
          </h3>
          <span
            className={`inline-flex items-center rounded-pill border border-creme/40 text-creme ${
              mobile ? "px-4 py-1.5 text-xs" : "px-5 py-2 text-sm"
            } font-medium tracking-wide backdrop-blur-sm bg-base-noir/30`}
          >
            {card.niveau}
          </span>
        </div>

        <div className="flex items-end justify-between gap-6">
          <p
            className={`text-creme font-medium leading-snug ${
              mobile
                ? "text-2xl xs:text-3xl max-w-sm"
                : "text-3xl md:text-4xl lg:text-5xl max-w-2xl"
            }`}
          >
            {card.sous}
          </p>
          <SlideIndicators
            current={index + 1}
            total={total}
            active
            shiftLeft={false}
            tone="strong"
          />
        </div>
      </div>
    </>
  );
}
