import { CAROUSEL_AUTOPLAY_MS, useCarousel } from "../carousel";

/**
 * The dots under every carousel, homepage and case study alike (they were
 * written out twice, in FeaturedProjects and Slideshow, until this).
 *
 * The active dot is a short pill that fills left to right over the
 * autoplay dwell (Micah, 2026-11-11). On the case studies' big slideshows
 * the slide itself gives no warning: it sits still for 4.2s and then
 * drifts, which on a picture that fills half the screen reads as "not a
 * carousel" until it moves (he assumed hover had paused it). The filling
 * pill says "this moves, and soon" without moving anything big. Picked
 * over showing the next slide's edge and over a quicker first advance.
 *
 * When autoplay isn't running (in hand, off screen, reduced motion) the
 * pill is simply full: the active state, with nothing counting.
 */
export default function CarouselDots({
  labels,
  label,
  carousel: c,
  slideCount,
}: {
  /** One per real image, in order; the dot's accessible name. */
  labels: string[];
  /** The carousel's name, for the tablist. */
  label: string;
  carousel: ReturnType<typeof useCarousel>;
  /** How many slides the track holds: twice `labels` when a pair is
   *  doubled for the loop. */
  slideCount: number;
}) {
  const real = labels.length;
  const shown = c.activeIndex % real;

  return (
    <div
      className="carousel__dots"
      role="tablist"
      aria-label={`${label} images`}
      // The fill's duration comes from the timer's own constant, so CSS
      // never has to mirror it by hand.
      style={{ "--carousel-dwell": `${CAROUSEL_AUTOPLAY_MS}ms` } as React.CSSProperties}
    >
      {labels.map((name, i) => (
        <button
          key={`${name}-${i}`}
          type="button"
          role="tab"
          aria-selected={i === shown}
          aria-label={name}
          className={`carousel__dot ${i === shown ? "is-active" : ""}`}
          onClick={() => {
            // In a doubled pair, go to whichever copy of slide i is nearer.
            if (i === shown) return;
            c.goTo(real === slideCount ? i : c.activeIndex + 1);
          }}
        >
          {i === shown && (
            // Keyed on what re-arms the autoplay timer (carousel.ts), so a
            // new slide, a release after a drag or coming back on screen
            // remounts it and the fill starts over in step with the timer.
            <span
              key={`${c.activeIndex}-${c.playing}`}
              className={`carousel__fill ${c.playing ? "is-counting" : ""}`}
              aria-hidden="true"
            />
          )}
        </button>
      ))}
    </div>
  );
}
