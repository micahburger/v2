import { useMemo, useRef } from "react";
import { featured, type Featured, type Media, type Slide } from "../data/site";
import { useOnScreen } from "../hooks";
import { relativeOffset, useCarousel } from "../carousel";

/**
 * Featured projects as the live site lays them out: one row per project,
 * the paragraph in the left five columns and the media in the right seven,
 * 16:9 with 28px corners.
 *
 * The whole paragraph is the link (Micah, 2026-11-07), not just the
 * project's name: the name stays in the text colour, and a round arrow
 * under the paragraph says the block is clickable. Hovering the block, or
 * the project's media, fills that arrow. Archive has no single destination,
 * so it keeps its inline links and no arrow.
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
      {project.href ? (
        <a className="featured__text featured__block" href={project.href}>
          <p>
            <span className="featured__name">{project.name}</span>
            {project.rest}
          </p>
          <span className="featured__arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M5 12h14M12.5 5.5 19 12l-6.5 6.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>
      ) : (
        <p className="featured__text">
          <span className="featured__name">{project.name}</span>
          {project.rest}
          {project.group && <GroupLinks links={project.group} />}
        </p>
      )}
      <div className="featured__side">
        <MediaView media={project.media} href={project.href} label={project.name} />
      </div>
    </li>
  );
}

/** "A, B, C and D." with each name linked, for a row that gathers several
 *  projects (Archive). */
function GroupLinks({ links }: { links: { label: string; href: string }[] }) {
  return (
    <>
      {links.map((link, i) => (
        <span key={link.href}>
          <a href={link.href}>{link.label}</a>
          {i < links.length - 2 ? ", " : i === links.length - 2 ? " and " : "."}
        </span>
      ))}
    </>
  );
}

function MediaView({ media, href, label }: { media: Media; href?: string; label: string }) {
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
  images: Slide[];
  /** The row's link; a slide's own href wins (Archive). */
  href?: string;
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
      <a
        className="featured__media"
        href={images[shown].href ?? href}
        tabIndex={-1}
        aria-hidden="true"
        draggable={false}
      >
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
