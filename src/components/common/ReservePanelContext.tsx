"use client";

import { createOverlayContext } from "./createOverlayContext";

/** Open/close state of the right-side Reserve panel and its imperative
 *  controls. Consumed by Header (Reserve CTA), Hebergements (per-card Reserve
 *  buttons), MapOverlay (the "Prêt à réserver ?" relay) and ReservePanel
 *  itself.
 *
 *  `toggle` comes along with the factory but is unused by design: the panel
 *  is always opened from a CTA and closed from inside it (X button, backdrop
 *  or Escape), never flipped by one shared control. */
const { Provider, useOverlay } = createOverlayContext("ReservePanel");

export { Provider as ReservePanelProvider, useOverlay as useReservePanel };
