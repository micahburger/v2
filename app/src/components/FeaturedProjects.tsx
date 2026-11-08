import { useMemo, useRef } from "react";
import { featured, type Featured, type Media, type Slide } from "../data/site";
import { useOnScreen } from "../hooks";
import { relativeOffset, useCarousel } from "../carousel";

const NEW_TAB = { target: "_blank", rel: "noreferrer" } as const;

/** Where a project link goes and how. Another site opens in a new tab, so
 *  this page stays put as the hub. A case study on this site ("/project/…")
 *  opens in place, the way any page of one site does, with the back button
 *  and the case study's own link home to return; it carries the query
 *  string so the palette the visitor picked follows them in. */
function linkTo(href: string | undefined) {
  if (!href) return {};
  if (!href.startsWith("/")) return { href, ...NEW_TAB };
  // The query is read at the click, not at render: the lab writes it to the
  // URL in an effect, after the render that would otherwise bake in the
  // previous pick. (Middle clicks don't fire click, hence auxclick too.)
  const withQuery = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.href = `${href}${window.location.search}`;
  };
  return { href, onClick: withQuery, onAuxClick: withQuery };
}

const isLocal = (href: string | undefined) => !!href?.startsWith("/");

/**
 * Featured projects as the live site lays them out: one row per project,
 * the paragraph in the left five columns and the media in the right seven,
 * 16:9 with 28px corners.
 *
 * How a row says "this goes somewhere" (Micah, 2026-11-07): the paragraph
 * is plain text and only the project's name is a link in it, underlined the
 * way the contact sentence's links are (faint at rest, a 2px line drawing
 * in on hover). A round arrow sits on the media's bottom-right corner, so
 * the picture and its arrow read as one thing to click. Picked in the lab
 * over two others: the whole paragraph as one link with a round arrow under
 * it (three clickable things per row: paragraph, arrow, media), and the
 * same paragraph link cued by an underlined name and no arrow.
 *
 * Archive has no single destination, so it keeps its inline links and no
 * arrow. Those links carry the same underline, since in the link colour
 * alone they read as a tint, not as four things to click.
 *
 * Every link to another site opens in a new tab (Micah, 2026-11-07), so
 * this page stays put as the hub to come back to. The text link says so to
 * screen readers; the media links are hidden from them already. Case
 * studies built into this site open in place (see linkTo).
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

const ARROW = (
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
);

function Row({ project }: { project: Featured }) {
  return (
    <li className="featured__row grid">
      <p className="featured__text">
        {project.href ? (
          // Only the name links; the rest of the paragraph is reading matter.
          <a className="featured__name u-line" {...linkTo(project.href)}>
            {project.name}
            {!isLocal(project.href) && <span className="visually-hidden"> (opens in a new tab)</span>}
          </a>
        ) : (
          <span className="featured__name">{project.name}</span>
        )}
        {project.rest}
        {project.group && <GroupLinks links={project.group} />}
      </p>
      <div className="featured__side">
        <MediaView media={project.media} href={project.href} label={project.name} corner={!!project.href} />
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
          <a className="u-line" href={link.href} {...NEW_TAB}>
            {link.label}
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
          {i < links.length - 2 ? ", " : i === links.length - 2 ? " and " : "."}
        </span>
      ))}
    </>
  );
}

/** The round arrow on the media's bottom-right corner. Inside the
 *  media link, so it's the same click as the picture. */
const CORNER = (
  <span className="featured__arrow featured__arrow--corner" aria-hidden="true">
    {ARROW}
  </span>
);

function MediaView({
  media,
  href,
  label,
  corner,
}: {
  media: Media;
  href?: string;
  label: string;
  corner: boolean;
}) {
  if (media.kind === "carousel" && media.images.length > 1) {
    return <Carousel images={media.images} href={href} label={label} corner={corner} />;
  }
  const src = media.kind === "image" ? media.src : media.images[0].src;
  return (
    // Same destination as the name link, so it's kept out of the tab order
    // and the accessibility tree: one stop per project, not two.
    <a className="featured__media" {...linkTo(href)} tabIndex={-1} aria-hidden="true" draggable={false}>
      <img src={src} alt="" loading="lazy" decoding="async" draggable={false} />
      {corner && CORNER}
    </a>
  );
}

function Carousel({
  images,
  href,
  label,
  corner,
}: {
  images: Slide[];
  /** The row's link; a slide's own href wins (Archive). */
  href?: string;
  label: string;
  corner: boolean;
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
        {...linkTo(images[shown].href ?? href)}
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
        {corner && CORNER}
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
