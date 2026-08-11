import { POURQUOI } from "@/lib/motion";

export type Slide = {
  title: string;
  body: string;
  image: string;
};

/** Three reasons answering the "Pourquoi Aquilon ?" question posed by
 *  MarqueeBrand directly above. Three slides, alternating layout
 *  (text-left, image-left, text-left). The section is short-pinned while the
 *  wheel handler intercepts scroll ticks and advances slides at fixed speed —
 *  one tick = one slide, no queueing, no scroll-velocity coupling.
 *
 *  Copy is anchored on a time of day (dawn / midday / dusk), and slide 3
 *  hands off to the Medaillons section that follows: it states the distance,
 *  Medaillons lights the fire. */
export const SLIDES: readonly Slide[] = [
  {
    title: "Le matin ne commence pas. Il monte du fleuve.",
    body: "La brume passe sous le plancher vers six heures. Vous n'avez rien d'autre à faire que la regarder.",
    image: "/images/pourquoi/aube.avif",
  },
  {
    title: "Le fjord change de couleur toutes les vingt minutes.",
    body: "On finit par arrêter de compter. C'est l'instant où la journée cesse d'avoir un programme.",
    image: "/images/pourquoi/fjord.avif",
  },
  {
    title: "Le soir, la lumière la plus proche est à quinze minutes de marche.",
    body: "Assez pour ne rien entendre. Assez peu pour changer d'avis.",
    image: "/images/pourquoi/crete.avif",
  },
] as const;

/** Timeline labels — one per slide, indexed 0..N-1 to match `currentSlide` so
 *  call sites read `tl.tweenTo(LABELS[target])` with no off-by-one conversion.
 *  Length must equal `SLIDES.length`. */
export const LABELS = ["slide-0", "slide-1", "slide-2"] as const;
export const LAST_INDEX = SLIDES.length - 1;

/** Image transform-scale applied to every slide image. The "why" photos are
 *  framed 4:5 for the portrait card, so `1` reads correctly — no crop needed.
 *  Used as the default of `SlideImage` (desktop slides) AND as the inline
 *  transform of the mobile `<Image>`, so the two paths stay in sync. */
export const SLIDE_IMAGE_ZOOM = 1;

/**
 * Single source of truth for the carousel's internal text rhythm.
 *
 * Principle: do NOT ballpark the text-swap delay. Every text timing is
 * **derived** from `POURQUOI.transitionDuration` (the card-slide duration), so
 * changing one knob keeps everything in sync.
 *
 * Sizing rationale:
 *  - `duration` ≈ half the card slide. The longest title's full reveal then
 *    takes ≈ `transitionDuration * 0.5 + chars * stagger`, which lands within
 *    (or just at the end of) the slide window.
 *  - `TEXT_SWAP_DELAY_MS` matches the RevealChars **reverse-out** time for the
 *    longest title — so the moment text-2 finishes fading out is exactly when
 *    text-3 starts fading in, both visible only while the card travels
 *    right-to-left.
 *
 * RevealChars internal formulas (from its source):
 *  - forward play time = `duration + (chars - 1) * stagger`
 *  - reverse-out time  = `duration * 0.5 + (chars - 1) * stagger * 0.5`
 */
export const TEXT_REVEAL = {
  /** Used for both the title (small stagger) and body (smaller still). */
  duration: POURQUOI.transitionDuration * 0.55,
  titleStagger: 0.012,
  bodyStagger: 0.008,
  bodyDelay: 0.05,
} as const;

const MAX_TITLE_CHARS = Math.max(...SLIDES.map((s) => s.title.length));

/** Derived from the longest title's reverse-out time at the config above.
 *  Fires text-3's `play=true` exactly when text-2's reverse-out finishes — no
 *  overlap, no gap, no hand-tuned constant. Re-derives itself if the copy
 *  changes length. */
export const TEXT_SWAP_DELAY_MS = Math.round(
  (TEXT_REVEAL.duration * 0.5 +
    Math.max(0, MAX_TITLE_CHARS - 1) * TEXT_REVEAL.titleStagger * 0.5) *
    1000,
);
