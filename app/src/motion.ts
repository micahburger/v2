// Every easing and duration the JS side uses. CSS can't read these, so the
// stylesheet repeats some of them by hand; each CSS site says which constant
// it mirrors. Change one, change both.

export const EASE = {
  /** Enter, hover, reveal. */
  enter: "cubic-bezier(0.22, 1, 0.36, 1)",
  /** Leaving. Always paired with a shorter duration than the enter. */
  exit: "cubic-bezier(0.4, 0, 1, 1)",
  /** Big moves: page colour, auto slides, zooms. */
  large: "cubic-bezier(0.65, 0, 0.35, 1)",
  /** Settling after a drag or a click. */
  settle: "cubic-bezier(0.32, 0.72, 0, 1)",
};

export const DUR = {
  /** Colour wash across the featured section (mirrored: --wash-ms). */
  wash: 700,
  /** A manual slide, after a click or a drag release. */
  settle: 400,
  /** A slide the carousel makes on its own. */
  auto: 700,
  /** Everything, when the visitor asked for less motion. */
  reduced: 120,
};

/** Drag commits once it passes this share of the card width… */
export const DRAG_COMMIT_RATIO = 0.2;
/** …or once the release is faster than this, in px/ms. */
export const DRAG_COMMIT_VELOCITY = 0.45;

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
