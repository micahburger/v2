// The JS half of the motion framework. The curves and durations live in
// CSS (the "motion" tokens in :root, global.css) since every animation on
// the site is CSS; the JS only needs to know whether to animate at all.
// (EASE, DUR and the drag constants that used to sit here went unused once
// the carousel and reveal moved to CSS transitions; removed 2026-11-11.)

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
