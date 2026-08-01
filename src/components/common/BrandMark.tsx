import { SITE_CONFIG } from "@/lib/constants";

/** Brand wordmark with a small registered-mark anchored low on the baseline. */
export default function BrandMark({ className }: { className?: string }) {
  return (
    <span className={className}>
      {SITE_CONFIG.name}
      <span
        className="ml-[0.04em] text-[0.32em] tracking-normal font-medium opacity-80"
        style={{ verticalAlign: "-0.05em" }}
        aria-hidden
      >
        ®
      </span>
    </span>
  );
}
