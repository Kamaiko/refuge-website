"use client";

import { createOverlayContext } from "./createOverlayContext";

/** Open/close state of the fullscreen Menu overlay, plus its imperative
 *  controls. Consumed by Header (the CTA toggles it) and MenuOverlay (renders
 *  the panel and its animations). This one genuinely uses `toggle` — the
 *  bottom-center pill is the same control for both directions. */
const { Provider, useOverlay } = createOverlayContext("Menu");

export { Provider as MenuProvider, useOverlay as useMenu };
