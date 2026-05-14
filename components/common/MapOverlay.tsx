"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useMapOverlay } from "./MapOverlayContext";
import { useReservePanel } from "./ReservePanelContext";
import { PANEL } from "@/lib/motion";
import { SITE_CONFIG } from "@/lib/constants";
import { CTA } from "@/lib/cta-dimensions";
import { MQ } from "@/lib/breakpoints";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/** Approximate coordinates of L'Acropole des Draveurs trail, within
 *  Parc national des Hautes-Gorges-de-la-Rivière-Malbaie (Charlevoix-Est).
 *  Picked because it's the iconic "deep Charlevoix" landmark and reads
 *  as a precise place rather than a generic town centroid. */
const PIN = {
  lat: 47.7864,
  lng: -70.2497,
  zoom: 9,
} as const;

/** Google Maps embed URL — no API key required. `ll=lat,lng` centers the
 *  map without dropping Google's red marker (`q=` would add one).
 *  `hl=fr` switches the map UI / road labels to French. */
const MAP_EMBED_URL = `https://maps.google.com/maps?ll=${PIN.lat},${PIN.lng}&z=${PIN.zoom}&hl=fr&output=embed&t=m`;

/** Gap between the open box and the viewport edges — same `inset-4`
 *  value the ReservePanel uses, for a coherent fullscreen-panel rhythm. */
const GAP = 16;
/** Border-radius the box settles to at the fully-open state — same value
 *  the MenuOverlay uses, so the fullscreen-overlay family lands on the
 *  same softness. */
const RADIUS_OPEN = 60;

/** Iframe over-extension on each side. The Google Maps embed renders
 *  attribution + "Ouvrir dans Maps" link + zoom + keyboard-shortcuts UI
 *  at the iframe's true corners — by inflating the iframe past every
 *  edge of the box and letting the box's clip-path crop the overflow,
 *  those UI chrome elements end up rendered off-screen. Symmetric per
 *  axis so the map's CSS center stays aligned with the box center
 *  (which is where our custom SVG pin sits). */
const IFRAME_BLEED = { x: 160, y: 100 } as const;

/** ARIA id linking the box's `aria-labelledby` to the Aquilon brand
 *  span at the top-left of the card — gives screen readers a stable
 *  accessible name without forcing us to ship a separate label string. */
const TITLE_ID = "map-overlay-title";

/** Build the clip-path string for a given progress p ∈ [0, 1]. Hoisted
 *  out of the component because it depends only on `window` + module
 *  constants — keeping it outside means a single function reference is
 *  re-used across renders, and no lint warnings about stale closures.
 *
 *  At p=0 the visible region collapses to a 0×0 point at viewport
 *  center (so the box is genuinely empty at rest); at p=1 it's a
 *  `GAP`-inset rectangle with `RADIUS_OPEN` corners.
 *
 *  The radius formula mirrors the MenuOverlay (and Hebergements card
 *  reveal) exactly: `target = cap + (RADIUS_OPEN - cap) * p`, clamped
 *  to `cap`. The effect is that, while the box's shorter side is <
 *  2 × RADIUS_OPEN, the radius equals the cap (= half shorter side =
 *  perfect capsule). Past that, the radius lerps DOWN from the growing
 *  cap toward RADIUS_OPEN — corners feel more rounded mid-animation
 *  than at rest, and ease into 60 px by the time the box reaches its
 *  open extent. */
function buildClipPath(p: number): string {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const top = (1 - p) * (vh / 2) + p * GAP;
  const left = (1 - p) * (vw / 2) + p * GAP;
  const bottom = top;
  const right = left;
  const width = vw - left - right;
  const height = vh - top - bottom;
  const cap = Math.min(width, height) / 2;
  const target = cap + (RADIUS_OPEN - cap) * p;
  const radius = Math.min(target, cap);
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`;
}

/**
 * Fullscreen Map overlay. A `clip-path: inset(... round ...)` mask grows
 * from a 0×0 point at viewport center into a fullscreen rounded card
 * (`inset(16px) round 60px`), mirroring the MenuOverlay's box-growth
 * feel but driven by clip-path so the iframe underneath stays at its
 * final size — the Google Maps tile mosaic is already loaded and
 * painted behind the growing mask, not flashed white while the iframe
 * boots after the animation starts.
 *
 * The iframe has `pointer-events: none` so the user can't pan or zoom —
 * the map is a static illustration of where the refuges are, and our
 * SVG pin at viewport center represents a precise lat/lng anchor that
 * can't be scrolled off. The iframe is also over-extended past every
 * edge of the box so the embed's native UI chrome (Open in Maps,
 * attribution, zoom controls, keyboard shortcuts) renders off-screen
 * and is clipped by the box's mask.
 *
 * Accessibility: role="dialog" + aria-modal + aria-labelledby give
 * screen readers a proper modal-context signal; focus is saved on the
 * trigger element on open and restored on close (mirrors MenuOverlay's
 * contract). Click on the backdrop, the explicit Close pill, and the
 * Escape key all dismiss the overlay. A `prefers-reduced-motion:
 * reduce` branch skips every tween and snaps directly to final state.
 *
 * Driven by {@link useMapOverlay} — must sit inside a `MapOverlayProvider`.
 */
export default function MapOverlay() {
  const { isOpen, close } = useMapOverlay();
  const { open: openReservePanel } = useReservePanel();
  const isMobile = useMediaQuery(MQ.belowMd);

  const backdropRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Skip the open/close GSAP effect on first mount — see the relevant
  // useGSAP below for why.
  const hasMountedRef = useRef(false);
  // Saved focus target for the open/close cycle (restored on close).
  const previousFocusRef = useRef<HTMLElement | null>(null);
  // Map → Reserve panel relay timer ID, so we can clear it on unmount
  // or re-entry instead of letting a stale firing arrive against an
  // unmounted tree.
  const relayTimerRef = useRef<number | null>(null);

  // Lazy-mount the Google Maps iframe — Google's embed pulls ~30
  // requests / ~1 MB on first load and sets cookies on the user's
  // browser. Mounting only after the first open keeps the cost off
  // every visitor's initial paint; once mounted it stays in the tree
  // so subsequent opens are instant.
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  useEffect(() => {
    // External-system sync (lazy-mount on first open); setState in
    // effect is intentional, identical to ReservePanel's mask-active
    // pattern in Header.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) setHasOpenedOnce(true);
  }, [isOpen]);

  // Pill dimensions for the bottom-center Close button track the same
  // mobile/desktop tiers as the Menu CTA (so the user perceives the
  // Menu pill morphing into the Close pill).
  const pillH = isMobile ? CTA.pillH.mobile : CTA.pillH.desktop;
  const circleH = isMobile ? CTA.circleH.mobile : CTA.circleH.desktop;
  const pillBottom = isMobile ? CTA.bottom.mobile : CTA.bottom.desktop;

  // Initial state — clip-path is written synchronously before paint so
  // the box is collapsed to a 0×0 point at viewport center. We do NOT
  // touch `autoAlpha` on the box: pairing an opacity tween with the
  // clip-path tween adds a one-frame paint at the initial state before
  // the tween moves it, which reads as jank. Letting the box stay at
  // default opacity 1 + clip-path-only visibility means the very first
  // onUpdate is the first paint.
  useGSAP(() => {
    if (boxRef.current) {
      boxRef.current.style.clipPath = buildClipPath(0);
    }
    if (backdropRef.current) gsap.set(backdropRef.current, { autoAlpha: 0 });
    if (cardRef.current) gsap.set(cardRef.current, { autoAlpha: 0, y: -16 });
    if (pinRef.current) gsap.set(pinRef.current, { autoAlpha: 0, scale: 0.4, y: 8 });
    // `xPercent: -50` keeps the close pill horizontally centered while
    // GSAP also animates `y` — Tailwind's `-translate-x-1/2` would get
    // wiped the moment GSAP writes its own `transform` matrix.
    if (closeRef.current) gsap.set(closeRef.current, { autoAlpha: 0, xPercent: -50, y: 24 });
  }, []);

  useGSAP(
    () => {
      // Skip the transition animation on the very first run. useGSAP
      // fires on mount with the initial isOpen (false), which would
      // otherwise enter the close branch and animate the clip-path
      // from p=1 (fullscreen) to p=0 — visible as a ghost exit
      // animation on every page refresh. The initial-state useGSAP
      // above already set everything to the correct closed state.
      if (!hasMountedRef.current) {
        hasMountedRef.current = true;
        return;
      }

      const backdrop = backdropRef.current;
      const box = boxRef.current;
      const card = cardRef.current;
      const pin = pinRef.current;
      const closePill = closeRef.current;
      if (!box || !backdrop) return;

      const mm = gsap.matchMedia();

      // Reduced motion: snap directly to the open / closed state with
      // no tweens. Mirrors the contract MenuOverlay and Feedback follow.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (isOpen) {
          box.style.clipPath = buildClipPath(1);
          gsap.set(backdrop, { autoAlpha: 1 });
          if (card) gsap.set(card, { autoAlpha: 1, y: 0 });
          if (pin) gsap.set(pin, { autoAlpha: 1, scale: 1, y: 0 });
          if (closePill) gsap.set(closePill, { autoAlpha: 1, xPercent: -50, y: 0 });
        } else {
          box.style.clipPath = buildClipPath(0);
          gsap.set(backdrop, { autoAlpha: 0 });
          if (card) gsap.set(card, { autoAlpha: 0, y: -16 });
          if (pin) gsap.set(pin, { autoAlpha: 0, scale: 0.4, y: 8 });
          if (closePill) gsap.set(closePill, { autoAlpha: 0, xPercent: -50, y: 24 });
        }
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (isOpen) {
          gsap.to(backdrop, {
            autoAlpha: 1,
            duration: 0.3,
            ease: PANEL.ease,
            overwrite: true,
          });

          const proxy = { p: 0 };
          gsap.to(proxy, {
            p: 1,
            duration: 0.85,
            ease: PANEL.ease,
            overwrite: true,
            onUpdate: () => {
              box.style.clipPath = buildClipPath(proxy.p);
            },
          });

          if (card) {
            gsap.to(card, {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              delay: 0.4,
              ease: PANEL.ease,
              overwrite: true,
            });
          }
          if (pin) {
            gsap.to(pin, {
              autoAlpha: 1,
              scale: 1,
              y: 0,
              duration: 0.75,
              delay: 0.5,
              ease: "back.out(1.7)",
              overwrite: true,
            });
          }
          if (closePill) {
            gsap.to(closePill, {
              autoAlpha: 1,
              xPercent: -50,
              y: 0,
              duration: 0.6,
              delay: 0.55,
              ease: PANEL.ease,
              overwrite: true,
            });
          }
        } else {
          if (closePill) {
            gsap.to(closePill, {
              autoAlpha: 0,
              xPercent: -50,
              y: 24,
              duration: 0.25,
              ease: PANEL.closeEase,
              overwrite: true,
            });
          }
          if (pin) {
            gsap.to(pin, {
              autoAlpha: 0,
              scale: 0.4,
              duration: 0.25,
              ease: PANEL.closeEase,
              overwrite: true,
            });
          }
          if (card) {
            gsap.to(card, {
              autoAlpha: 0,
              y: -16,
              duration: 0.25,
              ease: PANEL.closeEase,
              overwrite: true,
            });
          }

          const proxy = { p: 1 };
          gsap.to(proxy, {
            p: 0,
            duration: 0.65,
            ease: PANEL.closeEase,
            delay: 0.15,
            overwrite: true,
            onUpdate: () => {
              box.style.clipPath = buildClipPath(proxy.p);
            },
          });

          gsap.to(backdrop, {
            autoAlpha: 0,
            duration: 0.35,
            ease: PANEL.closeEase,
            delay: 0.4,
            overwrite: true,
          });
        }
      });

      return () => mm.revert();
    },
    { dependencies: [isOpen] },
  );

  // Keep the clip-path's collapsed state in sync with viewport size, so a
  // resize while the overlay is closed doesn't leave the next open at a
  // stale center point.
  useEffect(() => {
    const onResize = () => {
      if (isOpen || !boxRef.current) return;
      boxRef.current.style.clipPath = buildClipPath(0);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isOpen]);

  // Escape closes the overlay (mirrors MenuOverlay's contract).
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  // Focus management — save the trigger element on open, focus the
  // Close pill once the overlay is mounted/focusable, restore focus on
  // close. Paired with the `inert` attribute SmoothScroll applies to
  // <main> when any overlay is open, this creates a proper
  // keyboard-only flow. Same contract as MenuOverlay.
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = (document.activeElement as HTMLElement) ?? null;
      const id = window.setTimeout(() => {
        closeRef.current?.focus();
      }, 50);
      return () => window.clearTimeout(id);
    }
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  // The "Prêt à réserver ?" card link closes the map then opens the
  // Reserve panel — a small lag so the close clip-path tween starts
  // before the panel slide-in arrives, otherwise the two animations
  // collide visually.
  const handleReserveRelay = () => {
    close();
    if (relayTimerRef.current !== null) {
      window.clearTimeout(relayTimerRef.current);
    }
    relayTimerRef.current = window.setTimeout(() => {
      openReservePanel();
      relayTimerRef.current = null;
    }, 250);
  };
  useEffect(() => {
    return () => {
      if (relayTimerRef.current !== null) {
        window.clearTimeout(relayTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Backdrop noir — sits beneath the clipped box so the page behind
          dims uniformly during the reveal. `onClick={close}` gives the
          user a click-outside-to-dismiss escape hatch; pointer-events
          are flipped via React className so they snap exactly when
          isOpen changes (no GSAP delay). */}
      <div
        ref={backdropRef}
        onClick={close}
        className={`fixed inset-0 z-[279] bg-base-noir/85 invisible ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden
      />

      {/* The clipped box. role="dialog" + aria-modal + aria-labelledby
          announce the overlay as a modal to screen readers; the page
          behind it is already inerted by SmoothScroll. z-index sits
          just under MenuOverlay (z-290) so the Menu can still overlay
          the map if both happen to open.

          The inline `clipPath` on `style` collapses the visible region
          to a 0×0 point at viewport center BEFORE any GSAP code runs —
          otherwise the first browser paint after mount would show the
          fullscreen iframe (the box is `fixed inset-0` and the iframe
          is always mounted with the map URL loaded), producing a
          brief flash on every page refresh. After mount, useGSAP
          overwrites this inline style via direct DOM manipulation;
          React's reconciliation never re-applies the original JSX
          style as long as the prop hasn't changed, so GSAP's values
          persist. */}
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        // data-lenis-prevent: opt the overlay out of Lenis interception
        // so any future scrollable content inside reads native scroll.
        data-lenis-prevent
        className={`fixed inset-0 z-[280] bg-base-noir ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{ clipPath: "inset(50% 50% 50% 50% round 0px)" }}
        aria-hidden={!isOpen}
      >
        {/* Iframe is mounted lazily — only after the user first opens
            the overlay. Once mounted it stays in the tree, so later
            re-opens are instant (tiles cached). This keeps the
            ~30-request / ~1-MB Google Maps embed off the initial
            page weight for every visitor that never clicks the
            trigger. Over-extended past every edge of the box so the
            embed's native UI chrome (Open in Maps, attribution, zoom
            controls, keyboard shortcuts) renders off-screen and is
            clipped by the box's mask. `pointer-events: none` keeps
            it non-interactive so the SVG pin at viewport center
            stays anchored to the lat/lng. */}
        {hasOpenedOnce && <iframe
          src={MAP_EMBED_URL}
          title="Carte — emplacement des refuges Aquilon en Charlevoix"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute border-0 pointer-events-none"
          style={{
            top: `-${IFRAME_BLEED.y}px`,
            left: `-${IFRAME_BLEED.x}px`,
            width: `calc(100% + ${IFRAME_BLEED.x * 2}px)`,
            height: `calc(100% + ${IFRAME_BLEED.y * 2}px)`,
            // "Sable + Brume" palette. CSS filter is global, so the
            // tricky part is biasing land toward tan WITHOUT dragging
            // water toward brown. Strategy: `hue-rotate` is applied
            // FIRST in the chain to shift the water's blue into the
            // cyan/teal range BEFORE the sepia step can warm it; only
            // then a small sepia lifts the warm side enough to read
            // as tan on land.
            //  - `hue-rotate(-22deg)` : pre-rotates the spectrum so
            //    water (originally ~hue 200) lands closer to teal
            //    (~hue 178); the land's yellow-green slides toward
            //    warm orange.
            //  - `sepia` 0.2 : a small warm bias that finishes the
            //    cyan-into-teal nudge and gives land its tan tone.
            //    Kept low so it doesn't undo the hue rotation.
            //  - `saturate` 0.9 : enough chroma to let the teal pop
            //    as a real color instead of a gray, while staying
            //    short of "vibrant cartoon teal".
            //  - `brightness` 0.92 : darkens the off-white terrain
            //    into a saturated tan, not cream.
            //  - `contrast` 1.02 : a hair of contrast for edges.
            filter: "hue-rotate(-22deg) sepia(0.2) saturate(0.9) brightness(0.92) contrast(1.02)",
          }}
        />}

        {/* Aquilon info card — top-left, dark rounded card. Scaled ~50%
            larger than the inline version so it reads as a deliberate
            anchor against the wide-open map. */}
        <div
          ref={cardRef}
          className="absolute top-4 left-4 md:top-8 md:left-8 w-[min(33rem,calc(100vw-2rem))] rounded-[60px] bg-base-noir/95 text-creme p-9 md:p-10 backdrop-blur-md shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)]"
        >
          <div
            id={TITLE_ID}
            className="flex items-baseline gap-1 text-[2.25rem] md:text-[2.625rem] font-semibold leading-none"
          >
            <span>{SITE_CONFIG.name}</span>
            <sup className="text-sm text-creme-dim font-normal">®</sup>
          </div>
          <p className="mt-7 text-base md:text-lg leading-relaxed text-creme-dim">
            Charlevoix, QC G5A
            <br />
            Canada
          </p>
          <button
            type="button"
            onClick={handleReserveRelay}
            className="mt-6 inline-flex text-base md:text-lg text-creme underline decoration-creme/40 underline-offset-4 hover:decoration-creme transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-2 focus-visible:ring-offset-base-noir rounded-sm"
          >
            Prêt à réserver&nbsp;?
          </button>
          <div className="mt-7 flex gap-3">
            <div className="relative h-24 w-36 overflow-hidden rounded-2xl">
              <Image
                src="/images/refuge-brume.avif"
                alt="Refuge Brume"
                fill
                sizes="144px"
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="relative h-24 w-36 overflow-hidden rounded-2xl">
              <Image
                src="/images/refuge-aubepine.avif"
                alt="Refuge Aubépine"
                fill
                sizes="144px"
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Custom pin — viewport-center overlay. The iframe is
            non-interactive (no panning, no zooming) so the pin's
            screen position is permanently bound to the lat/lng we
            centered the map on. */}
        <div
          ref={pinRef}
          aria-hidden
          className="absolute left-1/2 top-1/2 pointer-events-none drop-shadow-[0_8px_22px_rgba(0,0,0,0.55)]"
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <svg
            width="60"
            height="74"
            viewBox="0 0 30 37"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M15 0C6.716 0 0 6.716 0 15c0 4.5 2.5 9 6 13 3 3.5 6.5 6.5 9 9 2.5-2.5 6-5.5 9-9 3.5-4 6-8.5 6-13C30 6.716 23.284 0 15 0z"
              fill="#181717"
            />
            <circle
              cx="15"
              cy="14.5"
              r="6.5"
              stroke="#F4EFE7"
              strokeWidth="1.6"
              fill="none"
            />
            <circle cx="15" cy="14.5" r="1.9" fill="#F4EFE7" />
          </svg>
        </div>

        {/* Close pill — bottom-center, dimensions mirror the Menu CTA
            across mobile/desktop tiers so the user perceives the Menu
            pill morphing into the Close pill. */}
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Fermer la carte"
          style={{
            height: pillH,
            paddingRight: CTA.pillPaddingRight,
            bottom: pillBottom,
          }}
          className="group absolute left-1/2 inline-flex items-center rounded-pill bg-creme font-medium text-base-noir transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-2 focus-visible:ring-offset-base-noir"
        >
          <span className="pl-8 pr-5 md:pl-12 md:pr-8 text-lg md:text-2xl whitespace-nowrap">
            Fermer
          </span>
          <span
            style={{ height: circleH, width: circleH }}
            className="inline-flex items-center justify-center rounded-full bg-gris-tan text-creme-terre/70 shrink-0 transition-colors group-hover:bg-base-noir group-hover:text-creme-terre"
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              aria-hidden
            >
              <path
                d="M7 7l16 16M23 7L7 23"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </button>
      </div>
    </>
  );
}
