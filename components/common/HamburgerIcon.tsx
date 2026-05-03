import { cn } from "@/lib/utils";

/** Three-bar hamburger glyph used by the Menu CTA. Bars inherit color from
 *  `currentColor`, mirroring the `<ArrowDiagonalIcon>` contract — pass color
 *  through `className` (e.g. `text-creme/85`). The `className` may also
 *  override the default `inline-flex` display via Tailwind utilities like
 *  `hidden md:inline-flex` for responsive swapping; tailwind-merge (`cn`)
 *  resolves the conflict correctly. */
export default function HamburgerIcon({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  // Bar height stays at 2px regardless of `size` — thicker bars at small
  // sizes look heavy. Vertical gap scales lightly with size.
  const gap = Math.max(4, Math.round(size * 0.22));
  return (
    <span aria-hidden className={cn("inline-flex flex-col", className)} style={{ gap }}>
      <span style={{ width: size, height: 2, background: "currentColor", borderRadius: 9999 }} />
      <span style={{ width: size, height: 2, background: "currentColor", borderRadius: 9999 }} />
      <span style={{ width: size, height: 2, background: "currentColor", borderRadius: 9999 }} />
    </span>
  );
}
