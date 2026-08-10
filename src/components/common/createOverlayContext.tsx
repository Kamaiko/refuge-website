"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type OverlayState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

/**
 * Builds the Provider + hook pair for a simple open/close overlay.
 *
 * MenuContext and ReservePanelContext were the same 39 lines twice over —
 * `createContext` + three `useCallback`s + a `useMemo` + a hook that throws
 * outside its provider — differing only in the name and in whether `toggle`
 * was exposed. Both are produced from here now.
 *
 * `MapOverlayContext` deliberately does NOT use this: it carries extra
 * `preloaded` / `preload()` state so the map iframe can mount before the
 * user clicks. Bending the factory to accommodate that would cost more in
 * generic plumbing than the duplication it removes.
 *
 * @param name Used in the "must be used within" error. Pass the provider's
 *             display name so a misplaced consumer says something useful.
 */
export function createOverlayContext(name: string) {
  const Ctx = createContext<OverlayState | null>(null);

  function Provider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((v) => !v), []);
    // Memoized so consumers don't re-render on every parent render. The
    // three callbacks are already stable, so `isOpen` is the only real
    // trigger.
    const value = useMemo(
      () => ({ isOpen, open, close, toggle }),
      [isOpen, open, close, toggle],
    );
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
  }
  Provider.displayName = `${name}Provider`;

  function useOverlay(): OverlayState {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error(`use${name} must be used within ${name}Provider`);
    return ctx;
  }

  return { Provider, useOverlay };
}
