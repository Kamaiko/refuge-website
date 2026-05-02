import { cn } from "@/lib/utils";

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/**
 * Static linear gradient overlay between two colors, interpolated in OKLAB.
 *
 * `linear-gradient(in oklab, ...)` is set via inline style so the OKLAB
 * interpolation is guaranteed at runtime — Tailwind v4's default OKLAB only
 * applies when both stops resolve at build time, which CSS-variable-backed
 * theme tokens (var(--color-…)) don't. Without this, the browser falls back
 * to sRGB and produces visible banding on dark colors.
 *
 * Renders absolute inset-0 by default (cover the parent). Pass `className`
 * to reposition.
 */
export function BgGradient({
  from,
  to,
  direction = "down",
  noiseOpacity = 0,
  className,
}: {
  /** CSS color, e.g. "var(--color-base-noir)" */
  from: string;
  /** CSS color, e.g. "var(--color-gris-tan)" */
  to: string;
  /** Vertical direction of the gradient. */
  direction?: "down" | "up";
  /** SVG turbulence noise opacity. 0 disables (default — OKLAB interpolation
   *  alone is enough on most displays). Bump to 0.04 only if banding
   *  appears on a specific gradient. */
  noiseOpacity?: number;
  /** Override the default `absolute inset-0` positioning. */
  className?: string;
}) {
  const angle = direction === "down" ? 180 : 0;
  return (
    <>
      <div
        aria-hidden
        className={cn("absolute inset-0 pointer-events-none", className)}
        style={{
          background: `linear-gradient(${angle}deg in oklab, ${from}, ${to})`,
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
