/**
 * Lands an Archive anchor (/project/archive#wwe) and keeps it landed while
 * the page settles.
 *
 * The first scroll happens as soon as the layout exists, but the page can
 * still change height above the target afterwards: the web fonts arrive
 * and the text above re-wraps (on the Archive that moved a chapter
 * ~130px off its mark), and images finish loading. So, like the
 * homepage's scroll memory (homeScroll.ts), it scrolls again once the
 * fonts are in and once the page has loaded, and stops trying the moment
 * the visitor scrolls, taps or presses a key, so it never fights a hand
 * that's already moving.
 */
export function holdAnchor(scroll: () => void) {
  scroll();
  let cancelled = false;
  const stop = () => {
    cancelled = true;
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("keydown", stop);
    window.removeEventListener("load", again);
  };
  const again = () => {
    if (!cancelled) scroll();
  };
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });
  window.addEventListener("keydown", stop);
  document.fonts?.ready.then(again);
  if (document.readyState === "complete") again();
  else window.addEventListener("load", again, { once: true });
  // Long enough for fonts and the first screens; then let go entirely.
  window.setTimeout(stop, 4000);
  return stop;
}
