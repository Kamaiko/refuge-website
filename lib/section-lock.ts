/**
 * Section-level Lenis lock — the wire contract between scroll-hijacking
 * sections (e.g. {@link Vivre}'s wheel-driven carousel) and the global
 * {@link SmoothScroll} provider that owns the Lenis instance.
 *
 * A section dispatches `SECTION_LOCK_EVENT` on `window` with a boolean
 * `lock` payload; SmoothScroll listens for it and stops/starts Lenis
 * accordingly. Without this stop, Lenis's smooth-scroll tween would
 * carry the user past the pinned section faster than the wheel handler
 * inside the section can intercept.
 *
 * Keep both the event name and the payload shape here so the dispatcher
 * and the listener can never drift out of sync.
 */
export const SECTION_LOCK_EVENT = "section-lock" as const;

export type SectionLockDetail = { lock: boolean };

/** Type-safe dispatcher for the section-lock event. */
export function dispatchSectionLock(lock: boolean): void {
  window.dispatchEvent(
    new CustomEvent<SectionLockDetail>(SECTION_LOCK_EVENT, {
      detail: { lock },
    }),
  );
}
