"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

/** Open/close state of the right-side Reserve panel and its imperative
 *  controls. Consumed by Header (Reserve CTA), Capsules (per-card Reserve
 *  buttons), and ReservePanel (renders the panel + form).
 *  No `toggle` here on purpose — the Reserve panel is always opened from a
 *  CTA (`open`) and closed from inside (`close` via X button or backdrop). */
type ReservePanelState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const ReservePanelContext = createContext<ReservePanelState | null>(null);

/** Wraps the app so {@link useReservePanel} can read/control the Reserve
 *  panel state. Must sit above any consumer in the tree. */
export function ReservePanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  return (
    <ReservePanelContext.Provider value={{ isOpen, open, close }}>
      {children}
    </ReservePanelContext.Provider>
  );
}

/** Read the Reserve panel state and its controls. Throws if called outside
 *  a {@link ReservePanelProvider}. */
export function useReservePanel() {
  const ctx = useContext(ReservePanelContext);
  if (!ctx) throw new Error("useReservePanel must be used within ReservePanelProvider");
  return ctx;
}
