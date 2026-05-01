"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type ReservePanelState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const ReservePanelContext = createContext<ReservePanelState | null>(null);

export function ReservePanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  return (
    <ReservePanelContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </ReservePanelContext.Provider>
  );
}

export function useReservePanel() {
  const ctx = useContext(ReservePanelContext);
  if (!ctx) throw new Error("useReservePanel must be used within ReservePanelProvider");
  return ctx;
}
