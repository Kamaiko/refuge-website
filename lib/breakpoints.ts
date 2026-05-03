/** Breakpoints in pixels — single source of truth shared between
 *  Tailwind (CSS) and JavaScript (matchMedia / GSAP).
 *
 *  Tailwind reads its breakpoints from `@theme` in `app/globals.css`:
 *    --breakpoint-xs: 24.375rem;  // 390px
 *    (sm/md/lg/xl stay at Tailwind's defaults)
 *
 *  This file mirrors those values for use in JS land. **Edit BOTH places
 *  when changing a breakpoint** — the convention is tighter than codegen
 *  for a project this size.
 *
 *  Naming: `belowMd` reads naturally next to a Tailwind class like
 *  `xs:text-lg md:text-xl` — same mental model. */
export const BP = {
  xs: 390,
  md: 768,
} as const;

export const MQ = {
  /** Tiny mobile (iPhone SE and similar) and below. */
  belowXs: `(max-width: ${BP.xs - 1}px)`,
  /** Mobile range — anything below the desktop layout breakpoint. */
  belowMd: `(max-width: ${BP.md - 1}px)`,
  /** Desktop layouts kick in. */
  mdUp: `(min-width: ${BP.md}px)`,
} as const;
