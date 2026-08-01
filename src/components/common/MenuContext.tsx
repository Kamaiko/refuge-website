"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/** Open/close state of the fullscreen Menu overlay, plus its imperative
 *  controls. Consumed by Header (CTA toggle) and MenuOverlay (renders the
 *  panel + animations). */
type MenuState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const MenuContext = createContext<MenuState | null>(null);

/** Wraps the app so {@link useMenu} can read/control the Menu overlay state.
 *  Must sit above any consumer (Header CTA, MenuOverlay) in the tree. */
export function MenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  // Memoize so consumers don't re-render on every parent render.
  const value = useMemo(() => ({ isOpen, open, close, toggle }), [isOpen, open, close, toggle]);
  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}

/** Read the Menu overlay state and its controls. Throws if called outside
 *  a {@link MenuProvider}. */
export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used within MenuProvider");
  return ctx;
}
