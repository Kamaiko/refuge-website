"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Project-wide GSAP singleton. Registers ScrollTrigger once on the client
 * and sets the default ease/duration for tweens created without explicit
 * values. Always import GSAP from this module instead of `gsap` directly
 * so the plugin registration runs before any tween touches scroll-driven
 * animation.
 *
 * The `"use client"` directive above guarantees this module only ever
 * runs in the browser — no SSR guard needed.
 */
gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: "expo.out", duration: 1.2 });

/**
 * Refresh « poli » : JAMAIS pendant une glisse. Un ScrollTrigger.refresh()
 * recalcule tous les triggers de la page (layout complet, 50-150 ms) ; s'il
 * tombe au milieu d'un scroll Lenis, la glisse gèle net — c'est le « stutter
 * ~2 s après un rechargement » observé par Patrick sur les deux sites
 * (mesuré : long task à t≈2 s, réseau froid — les images/polices tardives
 * déclenchaient le refresh pendant le scroll). Deux coupables, même remède :
 *  1. le refresh auto de GSAP sur window `load` — retiré de
 *     `autoRefreshEvents` ci-dessous, ré-abonné ici en version différée;
 *  2. tout refresh applicatif (images/polices arrivées en retard) —
 *     appeler refreshWhenIdle() au lieu de ScrollTrigger.refresh().
 * Si l'utilisateur scrolle, on attend `scrollEnd` (fin de glisse) ; sinon
 * le refresh part immédiatement. La correction des positions arrive donc à
 * la première pause — jamais au prix d'une frame gelée en pleine glisse.
 */
let refreshQueued = false;
export function refreshWhenIdle() {
  if (refreshQueued) return;
  if (!ScrollTrigger.isScrolling()) {
    ScrollTrigger.refresh();
    return;
  }
  refreshQueued = true;
  const onEnd = () => {
    ScrollTrigger.removeEventListener("scrollEnd", onEnd);
    refreshQueued = false;
    ScrollTrigger.refresh();
  };
  ScrollTrigger.addEventListener("scrollEnd", onEnd);
}

if (typeof window !== "undefined") {
  // Défaut GSAP : "visibilitychange,DOMContentLoaded,load,resize" — on
  // retire `load` (celui qui tombait à ~2 s en plein scroll) et on le
  // remplace par la version différée.
  ScrollTrigger.config({ autoRefreshEvents: "visibilitychange,DOMContentLoaded,resize" });
  if (document.readyState === "complete") refreshWhenIdle();
  else window.addEventListener("load", () => refreshWhenIdle(), { once: true });
}

export { gsap, ScrollTrigger };
