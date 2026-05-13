import { Fragment, type ReactNode } from "react";

/** Social-icon entries shared by {@link MenuOverlay} and {@link Cta}.
 *  Each entry's `svg` is the inner content of a 24×24 viewBox — stroke
 *  inherits `currentColor` so the consumer controls the icon tint via
 *  its surrounding text color. */
export type SocialItem = {
  /** Platform identifier — used as the React `key`. */
  id: "instagram" | "linkedin" | "github";
  /** Destination URL. Opens in a new tab. */
  href: string;
  /** Accessible label suffix — full label is `${platform} — ${ariaSuffix}`. */
  ariaSuffix: string;
  /** Pre-rendered SVG inner content (paths / rects / circles). */
  svg: ReactNode;
};

export const SOCIALS: readonly SocialItem[] = [
  {
    id: "instagram",
    href: "https://www.instagram.com/patrickpatenaude/",
    ariaSuffix: "Patrick Patenaude",
    svg: (
      <Fragment>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </Fragment>
    ),
  },
  {
    id: "linkedin",
    href: "https://www.linkedin.com/in/patrickpatenaude",
    ariaSuffix: "Patrick Patenaude",
    svg: (
      <Fragment>
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </Fragment>
    ),
  },
  {
    id: "github",
    href: "https://github.com/Kamaiko",
    ariaSuffix: "Patrick Patenaude",
    svg: (
      <path
        d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
] as const;

/** Platform label for the icon's `aria-label`. */
export const SOCIAL_LABELS: Record<SocialItem["id"], string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  github: "GitHub",
};
