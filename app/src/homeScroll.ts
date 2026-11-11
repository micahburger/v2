import { useLayoutEffect } from "react";

/**
 * Back to home returns you to where you were on the homepage (Micah,
 * 2026-11-10), not to the top.
 *
 * Moving between the homepage and a case study is a full page load (see
 * main.tsx), so nothing in memory survives it. The homepage writes its
 * scroll position to sessionStorage as it's left; the case study's Back to
 * home pill leaves a one-time note that this load is a return; the
 * homepage, finding the note, scrolls back to the saved spot before its
 * first paint.
 *
 * Only that pill restores. A reload, a typed URL or a fresh visit still
 * opens at the top, which is what they mean. The browser's own back button
 * is left to the browser, which already brings the scroll back. Both keys
 * live in sessionStorage, so they belong to this tab alone and are gone
 * when it closes.
 *
 * Every storage call is wrapped: private windows and blocked site data can
 * throw, and the worst case should be starting at the top as before.
 */

const POSITION = "home-scroll-y";
const RETURNING = "home-scroll-return";

function read(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    // Storage unavailable: nothing to remember, nothing to restore.
  }
}

/** Called by the case study's Back to home pill on a plain click. Not on a
 *  middle or modified click: that opens home in another tab, which some
 *  browsers seed with a copy of this tab's sessionStorage, and a new tab
 *  should open at the top. */
export function markReturnHome() {
  write(RETURNING, "1");
}

/**
 * The homepage's half: restore on a return, then keep the saved position
 * current for the next trip out.
 *
 * Restoring runs in a layout effect, so the jump happens before the first
 * paint and there's no flash of the top of the page. It's repeated once
 * the web fonts are in and once everything has loaded, because the page
 * can still grow a little after first render; a single early scroll would
 * be clamped short. Those retries stop the moment the visitor scrolls,
 * taps or presses a key, so they never fight a hand that's already moving.
 */
/** Whether this page load is a return, read once per load: the note is
 *  one-time, and StrictMode runs effects twice in dev, so the second run
 *  must not find it already spent. */
let returningThisLoad: boolean | null = null;

export function useHomeScroll() {
  useLayoutEffect(() => {
    if (returningThisLoad === null) {
      returningThisLoad = read(RETURNING) === "1";
      write(RETURNING, null);
    }
    const returning = returningThisLoad;
    const saved = Number(read(POSITION));

    let cancelled = false;
    let onCleanup = () => {};
    const stop = () => {
      cancelled = true;
    };
    const restore = () => {
      if (!cancelled) window.scrollTo({ top: saved, behavior: "instant" as ScrollBehavior });
    };

    if (returning && saved > 0) {
      // The browser would otherwise put its own idea of the scroll back
      // after load and undo this.
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      restore();
      requestAnimationFrame(restore);
      document.fonts?.ready.then(restore);
      // The last retry, after which the browser gets its scroll memory back,
      // so a reload from here behaves as it always has.
      const settle = () => {
        restore();
        if ("scrollRestoration" in history) history.scrollRestoration = "auto";
      };
      if (document.readyState === "complete") requestAnimationFrame(settle);
      else window.addEventListener("load", settle, { once: true });
      onCleanup = () => window.removeEventListener("load", settle);
      // The listeners that mean "the visitor has taken over".
      window.addEventListener("wheel", stop, { once: true, passive: true });
      window.addEventListener("touchstart", stop, { once: true, passive: true });
      window.addEventListener("keydown", stop, { once: true });
    }

    // Saved as the page is left (pagehide covers a link, the back button
    // and closing; visibilitychange covers iOS switching away first).
    const save = () => write(POSITION, String(Math.round(window.scrollY)));
    const onHidden = () => {
      if (document.visibilityState === "hidden") save();
    };
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onHidden);

    return () => {
      stop();
      onCleanup();
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, []);
}
