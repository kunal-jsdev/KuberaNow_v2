/**
 * Keeps at most one header hover menu (group dropdown or link preview) open.
 *
 * Menus close on a short delay so the pointer can cross the gap into their
 * panel; without this, moving quickly to the next menu briefly shows both.
 * Opening a menu dismisses the previous one immediately instead.
 */
let activeDismiss: (() => void) | null = null;

export function claimNavMenu(dismiss: () => void) {
  if (activeDismiss && activeDismiss !== dismiss) activeDismiss();
  activeDismiss = dismiss;
}

export function releaseNavMenu(dismiss: () => void) {
  if (activeDismiss === dismiss) activeDismiss = null;
}

/** Closes whichever header menu is open (e.g. after navigating). */
export function dismissActiveNavMenu() {
  activeDismiss?.();
}

/**
 * True when a click inside a menu panel followed a link (a story, the "see
 * all" heading), so the menu can close right away instead of waiting for the
 * route change.
 */
export function isLinkClick(e: React.MouseEvent) {
  return !!(e.target as Element).closest('a');
}
