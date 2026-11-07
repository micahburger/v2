import { useEffect, useRef, useState } from "react";
import { featured, type Featured, type Media } from "../data/site";
import { useOnScreen, useReducedMotion } from "../hooks";

/**
 * Featured projects as the live site lays them out: one row per project,
 * the paragraph (project name linked inline) in the left five columns and
 * the media in the right seven, 16:9 with 28px corners. Deliberately plain;
 * the first round of carousels (app/_archive) was too much.
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
      {/* The media links to the same place as the name. Kept out of the tab
          order and the accessibility tree so each project is one stop, not
          two identical ones. */}
      <a className="featured__media" href={project.href} tabIndex={-1} aria-hidden="true">
        <MediaView media={project.media} />
      </a>
    </li>
  );
}

function MediaView({ media }: { media: Media }) {
  if (media.kind === "image") {
    return <img src={media.src} alt="" loading="lazy" decoding="async" />;
  }
  return <Slideshow images={media.images} />;
}

/** How long each slide holds, and the crossfade between them. The live
 *  Semplice slideshows autoplay with a fade; these are close to its pace. */
const HOLD_MS = 3200;

/**
 * Autoplaying crossfade. Every slide is in the DOM from the start (so the
 * next one is already decoded when it fades in) and only the current one is
 * opaque. It only runs while the row is on screen, and never with reduced
 * motion, where the first slide simply stays.
 */
function Slideshow({ images }: { images: { src: string; alt: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(ref, 0.3);
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!onScreen || reduced) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % images.length), HOLD_MS);
    return () => window.clearInterval(t);
  }, [onScreen, reduced, images.length]);

  return (
    <div className="slideshow" ref={ref}>
      {images.map((image, i) => (
        <img
          key={image.src}
          src={image.src}
          alt=""
          className={i === index ? "is-current" : ""}
          loading={i === 0 ? "lazy" : "eager"}
          decoding="async"
        />
      ))}
    </div>
  );
}
