import { useMemo, useRef } from "react";
import type { Img } from "../data/caseStudies";
import { useOnScreen } from "../hooks";
import { relativeOffset, useCarousel } from "../carousel";
import CarouselDots from "./CarouselDots";

/**
 * A case study's image set: the homepage's grab-and-swipe carousel
 * (carousel.ts, the same .carousel__* styles) without the link around it.
 * Drifts every 4.2s while it's on screen, can be grabbed and thrown, dots
 * below. Replaces the live page's Semplice slider, which hid most of the
 * set off the edges of the window.
 *
 * Mirrors FeaturedProjects' Carousel; that one also carries the row's link
 * and per-slide hrefs, which is why they're two components and not one.
 */
export default function Slideshow({
  images,
  label,
  bare = false,
}: {
  images: Img[];
  label: string;
  /** For screens that carry their own ground (a RentSpree chapter's): no
   *  rounded frame or --media-bg behind them, and each one scaled to fit the
   *  box rather than cropped to fill it. The box takes the tallest screen's
   *  shape, so a taller one never loses its bottom edge. */
  bare?: boolean;
}) {
  // Two slides can't loop seamlessly (see FeaturedProjects); double them.
  const slides = useMemo(() => (images.length === 2 ? [...images, ...images] : images), [images]);
  const real = images.length;

  const rowRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(rowRef, 0.5);
  const c = useCarousel({ count: slides.length, active: onScreen });
  const shown = c.activeIndex % real;
  const box = bare
    ? images.reduce((tallest, image) =>
        image.height / image.width > tallest.height / tallest.width ? image : tallest,
      )
    : images[0];

  return (
    <div
      ref={rowRef}
      className="carousel"
      role="group"
      aria-roledescription="carousel"
      aria-label={`${label}, image ${shown + 1} of ${real}: ${images[shown].alt}`}
    >
      <div
        className={`cs-frame cs-frame--stage ${bare ? "cs-frame--bare" : ""}`}
        style={{ aspectRatio: `${box.width} / ${box.height}` }}
      >
        <div className="carousel__stage" data-phase={c.phase} data-source={c.source} {...c.handlers}>
          <div ref={c.trackRef} className="carousel__track" style={{ transform: `translate3d(${c.offset}, 0, 0)` }}>
            {slides.map((image, i) => (
              <img
                key={`${image.src}-${i}`}
                className="carousel__slide"
                src={image.src}
                alt=""
                draggable={false}
                decoding="async"
                loading={i < 2 ? "eager" : "lazy"}
                style={{ "--slide": relativeOffset(i, c.index, slides.length) } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      </div>
      <CarouselDots labels={images.map((image) => image.alt)} label={label} carousel={c} slideCount={slides.length} />
    </div>
  );
}
