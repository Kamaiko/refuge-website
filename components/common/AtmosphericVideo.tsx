import { cn } from "@/lib/utils";

type Props = {
  src: string;
  className?: string;
  opacity?: number;
  poster?: string;
};

/**
 * Background atmospheric video layer. Used as a subtle ambient backdrop
 * (smoke / brume / lumière qui passe) behind text or transitions.
 * Always muted, looped, autoplay.
 */
export default function AtmosphericVideo({
  src,
  className,
  opacity = 0.4,
  poster,
}: Props) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ opacity }}
      aria-hidden
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
