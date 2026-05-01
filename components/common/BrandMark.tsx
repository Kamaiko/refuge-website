import { SITE_CONFIG } from "@/lib/constants";

/**
 * Renders the brand wordmark with a small registered-mark, anchored low on the
 * baseline (subtle, not obtrusive). Use anywhere "Brume" appears as the brand.
 */
export default function BrandMark({
  className,
  registeredClassName = "ml-[0.04em] text-[0.32em] tracking-normal font-medium opacity-80",
  registeredStyle = { verticalAlign: "-0.05em" },
}: {
  className?: string;
  registeredClassName?: string;
  registeredStyle?: React.CSSProperties;
}) {
  return (
    <span className={className}>
      {SITE_CONFIG.name}
      <span className={registeredClassName} style={registeredStyle} aria-hidden>
        ®
      </span>
    </span>
  );
}
