import { useState } from "react";
import { archiveSrc, type ArchiveProject } from "../../data/archive";
import { relativeOffset, useCarousel } from "../../carousel";
import Lightbox from "./Lightbox";
import Arrow from "./Arrow";

/**
 * One project's screens in the Archive: the site's grab-and-swipe carousel
 * (carousel.ts, the same hook and .carousel__* styles as the homepage and
 * the RentSpree panels) with arrows and a count instead of dots, and no
 * autoplay: these sit beside text someone is reading, and they asked to
 * look. (`active: false` is what turns autoplay off; it's the only thing
 * that flag does.)
 *
 * Ways to move: drag or swipe the picture, the arrow buttons, or the arrow
 * keys anywhere in the carousel. A click on the picture (not one that
 * ended a drag; the hook swallows that) or the corner button opens the
 * larger view at the same screen, and closing it leaves the carousel on
 * whichever screen it ended on.
 *
 * Every screen is shown whole (contain, not cover) in a 16:9 box on the
 * page's own ground, so the odd portrait phone or wide strip is letterboxed
 * rather than cropped, and the box never changes shape.
 */
export default function ArchiveCarousel({ project }: { project: ArchiveProject }) {
  const images = project.images;
  const count = images.length;
  const c = useCarousel({ count, active: false });
  const [zoom, setZoom] = useState<number | null>(null);
  const shown = c.activeIndex;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      c.goTo(shown + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      c.goTo(shown - 1);
    }
  };

  return (
    <div
      className="ax-carousel carousel"
      role="group"
      aria-roledescription="carousel"
      aria-label={`${project.client}: screens`}
      onKeyDown={onKeyDown}
    >
      <div className="ax-stage cs-frame cs-frame--stage">
        <div
          className="carousel__stage"
          data-phase={c.phase}
          data-source={c.source}
          {...c.handlers}
          onClick={() => setZoom(shown)}
        >
          <div ref={c.trackRef} className="carousel__track" style={{ transform: `translate3d(${c.offset}, 0, 0)` }}>
            {images.map((image, i) => (
              <img
                key={image.file}
                className="carousel__slide ax-slide"
                src={archiveSrc(project.slug, image)}
                alt={image.alt}
                aria-hidden={i !== shown}
                width={image.width}
                height={image.height}
                draggable={false}
                decoding="async"
                // The lead and its neighbours first; the rest when near.
                loading={i < 2 || i === count - 1 ? "eager" : "lazy"}
                style={{ "--slide": relativeOffset(i, c.index, count) } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
        <button type="button" className="ax-zoom" aria-label={`View larger: ${images[shown].alt}`} onClick={() => setZoom(shown)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M14 5h5v5M10 19H5v-5M19 5l-6 6M5 19l6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="ax-controls">
        <button type="button" className="ax-arrow" aria-label="Previous screen" onClick={() => c.goTo(shown - 1)}>
          <Arrow dir={-1} />
        </button>
        <p className="ax-count" aria-live="polite" aria-atomic="true">
          <span className="visually-hidden">Screen </span>
          {shown + 1} / {count}
        </p>
        <button type="button" className="ax-arrow" aria-label="Next screen" onClick={() => c.goTo(shown + 1)}>
          <Arrow dir={1} />
        </button>
      </div>

      {zoom !== null && (
        <Lightbox
          project={project}
          start={zoom}
          onClose={(last) => {
            setZoom(null);
            c.goTo(last);
          }}
        />
      )}
    </div>
  );
}
