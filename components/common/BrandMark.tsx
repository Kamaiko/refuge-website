import { SITE_CONFIG } from "@/lib/constants";

/**
 * Renders the brand wordmark with a small registered-mark superscript.
 * Use anywhere "Brume" appears as the brand (hero, footer, marquee, headers).
 */
export default function BrandMark({
  className,
  registeredClassName = "ml-[0.05em] text-[0.4em] align-super tracking-normal",
}: {
  className?: string;
  registeredClassName?: string;
}) {
  return (
    <span className={className}>
      {SITE_CONFIG.name}
      <sup className={registeredClassName} aria-hidden>
        ®
      </sup>
    </span>
  );
}
