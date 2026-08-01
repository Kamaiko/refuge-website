import { cn } from "@/lib/utils";

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/**
 * Linear gradient overlay between two colors. Uses inline `linear-gradient(in
 * oklab, ...)` because Tailwind v4's default OKLAB only resolves at build
 * time — var()-backed stops fall back to sRGB and band on dark colors.
 */
export default function BgGradient({
  from,
  to,
  direction = "down",
  toAt,
  noiseOpacity = 0,
  className,
}: {
  from: string;
  to: string;
  direction?: "down" | "up";
  /** Percent (0–100) at which the `to` color is fully reached. The
   *  gradient then holds `to` from that percent through 100%. Use to
   *  ensure a solid landing color in a specific zone (e.g. so a child
   *  overlay can match a flat color without a band). */
  toAt?: number;
  /** SVG noise dither. Default 0 (OKLAB alone is clean on most displays). */
  noiseOpacity?: number;
  className?: string;
}) {
  const angle = direction === "down" ? 180 : 0;
  const stops =
    toAt != null ? `${from}, ${to} ${toAt}%, ${to}` : `${from}, ${to}`;
  return (
    <>
      <div
        aria-hidden
        className={cn("absolute inset-0 pointer-events-none", className)}
        style={{
          background: `linear-gradient(${angle}deg in oklab, ${stops})`,
        }}
      />
      {noiseOpacity > 0 ? (
        <div
          aria-hidden
          className={cn("absolute inset-0 pointer-events-none mix-blend-overlay", className)}
          style={{
            backgroundImage: NOISE_SVG,
            opacity: noiseOpacity,
          }}
        />
      ) : null}
    </>
  );
}
