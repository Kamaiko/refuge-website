import { SITE_CONFIG } from "@/lib/constants";

/** Site-wide navigation items. Consumed by:
 *  - {@link MenuOverlay} — fullscreen menu link list.
 *  - {@link Cta} — bottom-right nav stack with per-link wheel-flip on hover.
 *
 *  Single source of truth so renaming a section (or its anchor id) only
 *  needs to be applied once. Order is significant — the menu and the CTA
 *  stack both render the items in array order. */
export const NAV = [
  { label: "Accueil", href: "#" },
  { label: "Introduction", href: "#manifeste" },
  { label: "Refuges", href: "#refuges" },
  { label: `Pourquoi ${SITE_CONFIG.brandMark} ?`, href: "#pourquoi" },
  { label: "Feedback", href: "#feedback" },
] as const;

export type NavItem = (typeof NAV)[number];
