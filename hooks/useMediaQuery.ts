"use client";

import { useCallback, useSyncExternalStore } from "react";

/** SSR-safe `matchMedia` hook. Returns `defaultValue` on the server and
 *  the first client render (so hydration matches), then reconciles to
 *  the real match state. Subscribes to media-query changes and tears
 *  down on unmount.
 *
 *  Implemented with `useSyncExternalStore` — the React-recommended
 *  pattern for browser APIs. Avoids the `setState`-in-`useEffect` race
 *  (and its lint warning) that the prior `useEffect` + `useState`
 *  version had.
 *
 *  Intended for paired use with {@link ../lib/breakpoints} — pass an `MQ`
 *  string (e.g. `useMediaQuery(MQ.belowMd)`) so all consumers share the
 *  same breakpoint values. For animation parameters that depend on the
 *  viewport, prefer `gsap.matchMedia()` instead — it auto-reverts tweens
 *  and ScrollTriggers when a query stops matching. */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
