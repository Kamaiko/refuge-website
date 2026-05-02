/**
 * Diagonal arrow (NE direction) used on Reserve / external CTAs.
 * Single-line stroke arrow with arrowhead — standard hairline style.
 */
export default function ArrowDiagonalIcon({
  size = 14,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M3 11L11 3M11 3H4M11 3V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
