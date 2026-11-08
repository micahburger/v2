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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatMonth(value: string | null) {
  if (!value) return "Present";
  const [y, m] = value.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** `inert` for React 18, whose types don't know the attribute yet. An empty
 *  string is how the DOM spells "on"; leaving it off entirely is "off". */
export function inertProps(on: boolean): Record<string, string> {
  return on ? { inert: "" } : {};
}
