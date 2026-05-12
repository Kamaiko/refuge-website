/** Pagination chips — two outlined circles. The `current` chip is more
 *  saturated; the `total` chip dimmed so they read as the position-in-
 *  series ("où je suis / combien il y en a"). Padding-zeros to two
 *  digits matches the reference Awwwards pattern (`01`, `02`, `03`).
 *
 *  `tone` controls the contrast against the surrounding surface :
 *   - `muted` (default) — `creme-terre` palette, blends with the warm
 *     gris-tan cards in Pourquoi where the indicators sit on a flat
 *     card background.
 *   - `strong` — brighter cream palette, used when the chips overlay
 *     a photograph (Carousel) where varied luminance demands higher
 *     contrast to stay legible. */
export default function SlideIndicators({
  current,
  total,
  active,
  shiftLeft = false,
  tone = "muted",
}: {
  current: number;
  total: number;
  active: boolean;
  /** When true, cancels most of the parent card's bottom-row left inset
   *  so the chips read closer to the card's edge. Set false on slides
   *  whose left edge sits in the floating Menu pill's zone. */
  shiftLeft?: boolean;
  tone?: "muted" | "strong";
}) {
  const fmt = (n: number) => String(n).padStart(2, "0");
  const marginXClass = shiftLeft
    ? "-ml-8 md:-ml-12 lg:-ml-14"
    : "ml-2 md:ml-3";
  const chips =
    tone === "strong"
      ? [
          { value: current, tone: "border-creme/70 text-creme" },
          { value: total, tone: "border-creme/35 text-creme/55" },
        ]
      : [
          { value: current, tone: "border-creme-terre/40 text-creme-terre/85" },
          { value: total, tone: "border-creme-terre/20 text-creme-terre/40" },
        ];
  return (
    <div
      aria-hidden
      className={`flex items-center gap-2 shrink-0 ${marginXClass} mb-2 md:mb-3 transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0"}`}
    >
      {chips.map(({ value, tone }, i) => (
        <span
          key={i}
          className={`inline-flex h-14 w-14 items-center justify-center rounded-full border text-sm font-medium tracking-wide ${tone}`}
        >
          {fmt(value)}
        </span>
      ))}
    </div>
  );
}
