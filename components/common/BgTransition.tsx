import { cn } from "@/lib/utils";

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/**
 * Linear gradient overlay between two colors. Uses inline `linear-gradient(in
 * oklab, ...)` because Tailwind v4's default OKLAB only resolves at build
 * time — var()-backed stops fall back to sRGB and band on dark colors.
 */
export function BgGradient({
  from,
  to,
  direction = "down",
  noiseOpacity = 0,
  className,
}: {
  from: string;
  to: string;
  direction?: "down" | "up";
  /** SVG noise dither. Default 0 (OKLAB alone is clean on most displays). */
  noiseOpacity?: number;
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
