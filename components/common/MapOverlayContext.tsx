"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/** Open/close state of the fullscreen Map overlay, plus imperative controls.
 *  Consumed by Proximite (underlined CTA in the section copy) and
 *  MapOverlay (renders the iframe + Aquilon card + Close pill, with a
 *  circle clip-path expand from the viewport center).
 *  No `toggle` — the overlay is always opened from the underlined word
 *  and closed from inside (Close pill, backdrop click, Escape).
 *
 *  `preloaded` + `preload()` let the trigger section (Proximite) signal
 *  intent before the user actually clicks — when the section enters the
 *  viewport, or on hover of the link — so MapOverlay can mount the
 *  iframe early and the tiles are already loaded by the time the
 *  reveal animation finishes. `open()` also flips `preloaded` so direct
 *  clicks without prior hover still trigger the mount. */
type MapOverlayState = {
  isOpen: boolean;
  preloaded: boolean;
  open: () => void;
  close: () => void;
  preload: () => void;
};

const MapOverlayContext = createContext<MapOverlayState | null>(null);

/** Wraps the app so {@link useMapOverlay} can read/control the Map overlay
 *  state. Must sit above any consumer in the tree. */
export function MapOverlayProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [preloaded, setPreloaded] = useState(false);
  const preload = useCallback(() => setPreloaded(true), []);
  const open = useCallback(() => {
    setPreloaded(true);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  // Memoize the value object so consumers (SmoothScroll, Header,
  // MapOverlay, Proximite) don't re-render on every parent render —
  // only when isOpen or preloaded actually flips.
  const value = useMemo(
    () => ({ isOpen, preloaded, open, close, preload }),
    [isOpen, preloaded, open, close, preload],
  );
  return (
    <MapOverlayContext.Provider value={value}>
      {children}
    </MapOverlayContext.Provider>
  );
}

/** Read the Map overlay state and its controls. Throws if called outside
 *  a {@link MapOverlayProvider}. */
export function useMapOverlay() {
  const ctx = useContext(MapOverlayContext);
  if (!ctx) throw new Error("useMapOverlay must be used within MapOverlayProvider");
  return ctx;
}
