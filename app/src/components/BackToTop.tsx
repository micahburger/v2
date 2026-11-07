import { useEffect, useState } from "react";
import { useReducedMotion } from "../hooks";

/** How far down the page before the button shows: roughly past the intro
 *  statement, where getting back to the top starts to be a real trip. */
const SHOW_AFTER_PX = 640;

/**
 * A small round button fixed bottom-right that takes you back to the top.
 * It only appears once you've scrolled past the intro, and its colours are
 * the page's own (see .to-top in global.css), so it follows the palette and
 * the scroll shift instead of sitting on top of them.
 *
 * After scrolling, focus moves to the page's h1, so a keyboard user lands
 * at the top too rather than being left on a button that just hid itself.
 */
export default function BackToTop() {
  const [shown, setShown] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setShown(window.scrollY > SHOW_AFTER_PX);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      className={`to-top ${shown ? "is-shown" : ""}`}
      aria-label="Back to top"
      // Hidden from the tab order while it's invisible.
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        document.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          d="M12 19V5M5.5 11.5 12 5l6.5 6.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
