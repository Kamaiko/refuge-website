import { SOCIALS, SOCIAL_LABELS } from "@/lib/data/socials";

/** Tone variants reflect the surface the row of icons sits on :
 *  - `on-noir` : darker border (`creme-dim/60`, border-2), used by {@link Cta}
 *    which sits over the base-noir / gris-tan page bg.
 *  - `on-gris-tan` : lighter border (`creme/20`, border), used by
 *    {@link MenuOverlay} which renders over a gris-tan backdrop. */
type Tone = "on-noir" | "on-gris-tan";

const CLASSES: Record<Tone, string> = {
  "on-noir":
    "inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-creme-dim/60 text-creme hover:border-creme transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-2 focus-visible:ring-offset-base-noir",
  "on-gris-tan":
    "inline-flex h-14 w-14 items-center justify-center rounded-full border border-creme/20 text-creme/70 hover:text-creme hover:border-creme/60 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-2 focus-visible:ring-offset-gris-tan",
};

/** Renders the project's social-icon row (Instagram / LinkedIn / GitHub)
 *  in the same DOM shape used by both {@link MenuOverlay} and {@link Cta}.
 *  The list itself lives in {@link SOCIALS} — adding a 4th platform is a
 *  one-line entry there.
 *
 *  The component renders only the `<a>` elements (no wrapping container),
 *  so callers can keep their own layout class (flex direction, gaps, refs
 *  for staggered entrance animations, etc.). */
export default function SocialIcons({ tone }: { tone: Tone }) {
  const linkCls = CLASSES[tone];
  return (
    <>
      {SOCIALS.map((s) => (
        <a
          key={s.id}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${SOCIAL_LABELS[s.id]} — ${s.ariaSuffix}`}
          className={linkCls}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
            {s.svg}
          </svg>
        </a>
      ))}
    </>
  );
}
