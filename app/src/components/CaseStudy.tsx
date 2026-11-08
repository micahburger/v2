import { Fragment, useEffect } from "react";
import type { Block, CaseStudy, Img, Note } from "../data/caseStudies";
import { useSectionStage } from "../hooks";
import BeforeAfter from "./BeforeAfter";
import Slideshow from "./Slideshow";
import SiteFooter from "./SiteFooter";
import BackToTop from "./BackToTop";

/**
 * A case study page, /project/<slug>: the title, then the study's blocks in
 * order (data/caseStudies.ts), then the homepage's sign-off footer.
 *
 * First pass (Micah, 2026-11-08): the live Semplice page's structure and
 * copy, rebuilt on the v2 homepage's grid, type and palettes, so it already
 * sits in the site and can be shifted toward it from here. It follows the
 * palette and scroll shift the visitor arrived with (the query string rides
 * along on the links in and out); ?palette=graphite is closest to the live
 * page's black.
 */
export default function CaseStudyPage({ study }: { study: CaseStudy }) {
  // The ds's "{Project} · Micah Lindenberger", with a middle dot for the
  // dash (no em dashes anywhere, titles included).
  useEffect(() => {
    document.title = `${study.name} · Micah Lindenberger`;
  }, [study.name]);

  useSectionStage();

  const home = `/${window.location.search}`;

  return (
    <>
      <main className="cs">
        <header className="cs-hero wrap" data-stage="0">
          {/* Back to the homepage, set where the homepage sets the name, so
              the two pages open the same way. */}
          <a className="cs-hero__home" href={home}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M19 12H5M11.5 5.5 5 12l6.5 6.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Micah Lindenberger
          </a>
          <h1 className="cs-hero__title" tabIndex={-1}>
            {study.title}
          </h1>
        </header>

        {study.blocks.map((block, i) => (
          <section
            key={i}
            className={`cs-block cs-block--${block.kind} ${block.kind === "heading" && block.ruled ? "cs-block--ruled" : ""} wrap`}
            data-stage={study.stages[i]}
          >
            <BlockView block={block} />
          </section>
        ))}

        <nav className="cs-end wrap" aria-label="Case study">
          <a className="u-line" href={home}>
            Back to all work
          </a>
        </nav>
      </main>

      <div data-stage="3">
        <SiteFooter />
      </div>
      <BackToTop />
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "intro":
      return (
        <div className="cs-intro grid">
          <div className="cs-intro__text">
            {block.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <dl className="cs-facts">
              {block.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <Picture image={block.image} className="cs-intro__media" eager />
        </div>
      );

    case "heading":
      return (
        <>
          <h2 className="cs-heading">{block.title}</h2>
          {block.lede && <p className="cs-lede">{block.lede}</p>}
        </>
      );

    case "split":
      return (
        <div className={`cs-split cs-split--${block.size} cs-split--image-${block.imageSide} grid`}>
          <figure className="cs-split__media">
            <Picture image={block.image} />
            {block.caption && <figcaption className="cs-caption">{block.caption}</figcaption>}
          </figure>
          <Notes notes={block.notes} className="cs-split__notes" />
        </div>
      );

    case "figure":
      return (
        <figure>
          <Picture image={block.image} />
          {block.caption && <figcaption className="cs-caption">{block.caption}</figcaption>}
        </figure>
      );

    case "compare":
      return (
        <>
          <BeforeAfter before={block.before} after={block.after} beforeLabel={block.beforeLabel} afterLabel={block.afterLabel} />
          {block.body && <p className="cs-body">{block.body}</p>}
        </>
      );

    case "slideshow":
      return (
        <>
          <Slideshow images={block.images} label={block.label} />
          {block.note && <Notes notes={[block.note]} className="cs-body" />}
        </>
      );

    case "takeaways":
      return (
        <ul className="cs-takeaways grid">
          {block.notes.map((note) => (
            <li key={note.title}>
              <h3 className="cs-label">{note.title}</h3>
              <p>{note.body}</p>
            </li>
          ))}
        </ul>
      );

    case "outcomes":
      return (
        <ul className="cs-outcomes grid">
          {block.items.map((item) => (
            <li key={item.label}>
              <h3 className="cs-label">{item.label}</h3>
              <p>
                <Starred text={item.text} />
              </p>
            </li>
          ))}
        </ul>
      );

    case "video":
      return (
        <div className="cs-frame" style={{ aspectRatio: `${block.width} / ${block.height}` }}>
          {/* Controls rather than autoplay, as on the live page: it's 13MB
              and has a beginning and an end. preload="none" so it costs
              nothing until it's played; the poster holds its place. */}
          <video
            className="cs-video"
            src={block.src}
            poster={block.poster}
            width={block.width}
            height={block.height}
            controls
            playsInline
            preload="none"
            aria-label={block.label}
          />
        </div>
      );
  }
}

/** A titled paragraph list: pain points, features. */
function Notes({ notes, className }: { notes: Note[]; className?: string }) {
  return (
    <ul className={`cs-notes ${className ?? ""}`}>
      {notes.map((note) => (
        <li key={note.title}>
          <h3 className="cs-notes__title">{note.title}</h3>
          <p>{note.body}</p>
        </li>
      ))}
    </ul>
  );
}

/** "a *starred phrase* here" with the starred parts as <em>. */
function Starred({ text }: { text: string }) {
  return (
    <>
      {text.split("*").map((part, i) => (i % 2 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}

/** One image, framed (a dark-ground export in a rounded box) or a cutout
 *  (a transparent phone, straight on the page). width and height reserve
 *  the box before it loads. */
function Picture({ image, className, eager }: { image: Img; className?: string; eager?: boolean }) {
  const img = (
    <img
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
  return image.look === "cutout" ? (
    <div className={`cs-cutout ${className ?? ""}`}>{img}</div>
  ) : (
    <div className={`cs-frame ${className ?? ""}`}>{img}</div>
  );
}
