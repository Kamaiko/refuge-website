"use client";

import { useEffect, useRef } from "react";

type Options = {
  isOpen: boolean;
  close: () => void;
  /** Resolved a frame after opening — return the element that should receive
   *  focus. Deferred rather than passed directly because the overlay usually
   *  isn't focusable until it has rendered. */
  focusTarget: () => HTMLElement | null | undefined;
};

/**
 * Keyboard contract shared by every fullscreen overlay: Escape closes, focus
 * moves into the overlay on open, and returns to whatever opened it on close.
 *
 * Paired with the `inert` attribute SmoothScroll puts on `<main>` while any
 * overlay is open, this is what makes the keyboard-only flow work — Tab
 * cycles inside the overlay and nowhere else.
 *
 * MenuOverlay, MapOverlay and ReservePanel each carried their own copy of
 * this, identical apart from which element got focus. Three copies of
 * accessibility logic is three chances for them to drift apart, and the one
 * that drifts is the one nobody notices.
 */
export function useOverlayA11y({ isOpen, close, focusTarget }: Options) {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  // Held in a ref so the focus effect doesn't need `focusTarget` in its deps:
  // call sites pass an inline arrow, which would otherwise change identity on
  // every render and re-run the effect (stealing focus back mid-interaction).
  // Synced in its own effect rather than during render — writing to a ref
  // while rendering is the pattern `react-hooks/refs` exists to catch.
  const focusTargetRef = useRef(focusTarget);
  useEffect(() => {
    focusTargetRef.current = focusTarget;
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = (document.activeElement as HTMLElement) ?? null;
      // One frame's grace so the overlay has rendered and is focusable.
      const id = window.setTimeout(() => {
        focusTargetRef.current()?.focus();
      }, 50);
      return () => window.clearTimeout(id);
    }
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);
}
