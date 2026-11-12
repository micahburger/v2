import { useEffect, type RefObject } from "react";
import { prefersReducedMotion } from "./motion";

/**
 * The one scroll reveal (ds Recipe 4), used by every case study and the
 * Archive (through CaseShell): within `root`, anything marked
 * `data-reveal` fades up once as it arrives. The CSS is "reveal" in
 * global.css and its timing comes from the motion tokens.
 *
 * - Armed only once this runs (it adds .is-revealing to `root`), so with
 *   no script nothing is ever left hidden.
 * - Blocks already on screen when the page arrives are shown at once: the
 *   page transition is already bringing them in, and animating them again
 *   would double the movement.
 * - Nothing at all under reduced motion.
 *
 * Lifted out of the Archive's long read on 2026-11-11, when the reveal
 * became part of the site's motion framework.
 */
export function useReveal(root: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    el.querySelectorAll("[data-reveal]").forEach((target) => {
      if (target.getBoundingClientRect().top < window.innerHeight) target.classList.add("is-in");
      else io.observe(target);
    });
    el.classList.add("is-revealing");
    return () => io.disconnect();
  }, [root]);
}
