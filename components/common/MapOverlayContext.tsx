"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/** Open/close state of the fullscreen Map overlay, plus imperative controls.
 *  Consumed by Proximite (underlined CTA in the section copy) and
 *  MapOverlay (renders the iframe + Aquilon card + Close pill, with a
 *  circle clip-path expand from the viewport center).
 *  No `toggle` — the overlay is always opened from the underlined word
 *  and closed from inside (Close pill, backdrop click, Escape). */
type MapOverlayState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const MapOverlayContext = createContext<MapOverlayState | null>(null);

/** Wraps the app so {@link useMapOverlay} can read/control the Map overlay
 *  state. Must sit above any consumer in the tree. */
export function MapOverlayProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  // Memoize the value object so consumers (SmoothScroll, Header,
  // MapOverlay, Proximite) don't re-render on every parent render —
  // only when isOpen actually flips.
  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);
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
