import { useMemo, useRef } from "react";
import { featured, type Featured, type Media } from "../data/site";
import { useOnScreen } from "../hooks";
import { relativeOffset, useCarousel } from "../carousel";

/**
 * Featured projects as the live site lays them out: one row per project,
 * the paragraph (project name linked inline) in the left five columns and
 * the media in the right seven, 16:9 with 28px corners.
 *
 * Where a project has more than one image, the media is the folio's
 * grab-and-swipe carousel (carousel.ts): it drifts on its own every 4.2s
 * while on screen, and can be grabbed and thrown. A plain click still opens
 * the project.
 */
export default function FeaturedProjects() {
  return (
    <ul className="featured">
      {featured.map((project) => (
        <Row key={project.id} project={project} />
      ))}
    </ul>
  );
}

function Row({ project }: { project: Featured }) {
  return (
    <li className="featured__row grid">
      <p className="featured__text">
        <a href={project.href}>{project.name}</a>
        {project.rest}
      </p>
      <div className="featured__side">
        <MediaView media={project.media} href={project.href} label={project.name} />
      </div>
    </li>
  );
}

function MediaView({ media, href, label }: { media: Media; href: string; label: string }) {
  if (media.kind === "carousel" && media.images.length > 1) {
    return <Carousel images={media.images} href={href} label={label} />;
  }
  const src = media.kind === "image" ? media.src : media.images[0].src;
  return (
    // Same destination as the name link, so it's kept out of the tab order
    // and the accessibility tree: one stop per project, not two.
    <a className="featured__media" href={href} tabIndex={-1} aria-hidden="true" draggable={false}>
      <img src={src} alt="" loading="lazy" decoding="async" draggable={false} />
    </a>
  );
}

function Carousel({
  images,
  href,
  label,
}: {
  images: { src: string; alt: string }[];
  href: string;
  label: string;
}) {
  // The seamless loop needs a slide parked past both edges, which two
  // slides can't do. Doubling a pair (a b a b) gives it that; the dots still
  // count the real two.
  const slides = useMemo(() => (images.length === 2 ? [...images, ...images] : images), [images]);
  const real = images.length;

  const rowRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(rowRef, 0.5);
  const c = useCarousel({ count: slides.length, active: onScreen });
  const shown = c.activeIndex % real;

  return (
    <div
      ref={rowRef}
      className="carousel"
      role="group"
      aria-roledescription="carousel"
      aria-label={`${label}, image ${shown + 1} of ${real}`}
    >
      <a className="featured__media" href={href} tabIndex={-1} aria-hidden="true" draggable={false}>
        <div
          className="carousel__stage"
          data-phase={c.phase}
          // Picks speed and curve in CSS: an autoplay drift is slow and
          // in-out, a thrown swipe is quick and all ease-out.
          data-source={c.source}
          {...c.handlers}
        >
          <div
            ref={c.trackRef}
            className="carousel__track"
            style={{ transform: `translate3d(${c.offset}, 0, 0)` }}
          >
            {slides.map((image, i) => (
              <img
                key={`${image.src}-${i}`}
                className="carousel__slide"
                src={image.src}
                alt=""
                draggable={false}
                decoding="async"
                // The first two are what the row opens on and swipes to
                // first; the rest can wait until the browser gets near them.
                loading={i < 2 ? "eager" : "lazy"}
                style={{ "--slide": relativeOffset(i, c.index, slides.length) } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      </a>
      <div className="carousel__dots" role="tablist" aria-label={`${label} images`}>
        {images.map((image, i) => (
          <button
            key={image.src}
            type="button"
            role="tab"
            aria-selected={i === shown}
            aria-label={image.alt}
            className={`carousel__dot ${i === shown ? "is-active" : ""}`}
            onClick={() => {
              // In a doubled pair, go to whichever copy of slide i is nearer.
              if (i === shown) return;
              c.goTo(real === slides.length ? i : c.activeIndex + 1);
            }}
          />
        ))}
      </div>
    </div>
  );
}
