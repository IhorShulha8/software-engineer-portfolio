/**
 * Utilities for respecting the user's motion preference.
 *
 * Per BRIEF.md §3: all animations must disable themselves when the user has
 * `prefers-reduced-motion: reduce` set at the OS level.
 */

/** Whether the current user prefers reduced motion. Reactive to changes. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Subscribe to reduced-motion changes. Returns an unsubscribe function.
 * Use in components that register long-lived animation loops so they can
 * tear themselves down when the user enables the setting.
 */
export function onReducedMotionChange(cb: (reduced: boolean) => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    cb(false);
    return () => {};
  }
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  cb(mql.matches);
  const handler = (e: MediaQueryListEvent) => cb(e.matches);
  mql.addEventListener('change', handler);
  return () => mql.removeEventListener('change', handler);
}
