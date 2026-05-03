"use client";

import { useEffect, useState } from "react";

/** SSR-safe `matchMedia` hook. Returns `defaultValue` on the first render
 *  (so server and client agree), then reconciles to the real match state
 *  after mount. Subscribes to media-query changes and tears down on
 *  unmount.
 *
 *  Intended for paired use with {@link ../lib/breakpoints} — pass an `MQ`
 *  string (e.g. `useMediaQuery(MQ.belowMd)`) so all consumers share the
 *  same breakpoint values. For animation parameters that depend on the
 *  viewport, prefer `gsap.matchMedia()` instead — it auto-reverts tweens
 *  and ScrollTriggers when a query stops matching. */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
