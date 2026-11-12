import { RefObject, useEffect, useState } from "react";

/** Live `prefers-reduced-motion`, so toggling it in DevTools takes effect
 *  without a reload. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/** True once the element has been on screen. Fires once and stays true: the
 *  build-ins are an arrival, not something to replay on every scroll past. */
export function useSeen(ref: RefObject<Element>, threshold = 0.2) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, seen, threshold]);
  return seen;
}

/** True when the element is at least partly on screen, re-evaluated as it
 *  comes and goes. Used to keep keyboard arrows and autoplay scoped to the
 *  carousel the visitor is actually looking at. */
export function useOnScreen(ref: RefObject<Element>, threshold = 0.35) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOn(entry.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return on;
}

/**
 * Which part of the page the visitor is in, written to <html data-stage>
 * for the scroll colour shift (see "section shift" in global.css): the last
 * element marked data-stage whose top has passed the middle of the
 * viewport. Because it's "last one passed", the gaps between sections keep
 * the stage of the section above, so the colour changes once per section
 * rather than flickering at the seams.
 *
 * A scroll listener (one rAF per frame at most) rather than an
 * IntersectionObserver: it's the same answer computed directly, and it
 * keeps working where observers are throttled, such as background tabs.
 * Runs whether or not a shift is on, so switching it on mid-page lands on
 * the right colour straight away. Homepage only: case studies sit on one
 * fixed colour (Night, no shift).
 */
export function useSectionStage() {
  useEffect(() => {
    const root = document.documentElement;
    // :not(html): the stage is written to <html data-stage>, which would
    // otherwise match too and feed its own last value back in.
    const marks = [...document.querySelectorAll<HTMLElement>("[data-stage]:not(html)")];
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight / 2;
      let stage = "0";
      for (const el of marks) {
        if (el.getBoundingClientRect().top <= line) stage = el.dataset.stage ?? stage;
      }
      // At the very bottom the footer can be too short to reach the middle
      // line; reaching the end of the page counts as being in it.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        stage = marks[marks.length - 1]?.dataset.stage ?? stage;
      }
      if (root.dataset.stage !== stage) root.dataset.stage = stage;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
}
