import { Fragment } from "react";
import type { Block, CaseStudy, Img, Note } from "../data/caseStudies";
import { CASE_LAB, LabState, useLab } from "../lab";
import BeforeAfter from "./BeforeAfter";
import Slideshow from "./Slideshow";
import CaseShell from "./CaseShell";

/**
 * A case study page, /project/<slug>: the title, then the study's blocks in
 * order (data/caseStudies.ts), then the homepage's sign-off footer.
 *
 * First pass (Micah, 2026-11-08): the live Semplice page's structure and
 * copy, rebuilt on the v2 homepage's grid and type. Always on the Night
 * palette with no scroll shift (set in index.html and main.tsx), whatever
 * the homepage is on: the screens were exported on that black, so they
 * read as part of the page rather than as boxes on it, as on the live
 * site. The lab query rides along on the link home.
 */
export default function CaseStudyPage({ study }: { study: CaseStudy }) {
  const [lab, setLab] = useLab();

  // The Outcomes lab only has something to switch where there's a results
  // block (Opendoor); elsewhere the pill would open onto nothing.
  const hasLab = study.blocks.some((block) => block.kind === "results");

  // The bar, title, footer and lab pill are CaseShell's, shared with the
  // Archive since 2026-11-11.
  return (
    <CaseShell name={study.name} title={study.title} labKeys={hasLab ? CASE_LAB : []} lab={lab} setLab={setLab}>
      {study.blocks.map((block, i) => (
        <section
          key={i}
          className={`cs-block cs-block--${block.kind} ${(block.kind === "heading" && block.ruled) || block.kind === "results" ? "cs-block--ruled" : ""} wrap`}
        >
          <BlockView block={block} outcomes={lab.outcomes} />
        </section>
      ))}
    </CaseShell>
  );
}

function BlockView({ block, outcomes }: { block: Block; outcomes: LabState["outcomes"] }) {
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

    case "pair":
      // One figure, two pictures: the caption speaks for both, as the live
      // pages' single line under a pair did.
      return (
        <figure className={`cs-pair cs-pair--${block.size} grid`}>
          {block.images.map((image) => (
            <Picture key={image.src} image={image} className="cs-pair__item" />
          ))}
          {block.caption && <figcaption className="cs-caption cs-pair__caption">{block.caption}</figcaption>}
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

    case "results":
      return <Results block={block} take={outcomes} />;

    case "chapter":
      return (
        <div
          className="cs-chapter grid"
          // The panel's own ground and ink, which its dots and CTA are
          // drawn from too (see .cs-chapter in global.css).
          style={{ "--chapter-bg": block.color, "--chapter-ink": block.ink } as React.CSSProperties}
        >
          <div className="cs-chapter__text">
            <h2 className="cs-chapter__title">{block.title}</h2>
            {block.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {block.cta && (
              <a className="cs-cta" href={block.cta.href}>
                {block.cta.label}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M5 12h14M12.5 5.5 19 12l-6.5 6.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            )}
          </div>
          <div className="cs-chapter__media">
            <Slideshow images={block.images} label={block.title} bare />
          </div>
        </div>
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

type ResultsBlock = Extract<Block, { kind: "results" }>;

/**
 * The close, three ways (lab "Outcomes", Micah 2026-11-08). The live page
 * ran three learnings as 22px paragraphs, then the numbers buried inside
 * two 36px sentences: five blocks of large type, nothing to scan. Each take
 * puts the numbers first. What was learned is one short reflection
 * paragraph (2026-11-10; it was three titled maxims before).
 *
 *  - STATS: the three numbers huge in a row, one short label under each,
 *    then the reflection.
 *  - LEDGER: a two-column table, the ds "table index" register. Section
 *    names on the left in four columns, rows with hairlines on the right:
 *    number then label, then the reflection as one ruled row of prose.
 *  - STATEMENT: the numbers as one large sentence with the figures in the
 *    accent, then the reflection.
 */
function Results({ block, take }: { block: ResultsBlock; take: LabState["outcomes"] }) {
  if (take === "ledger") {
    return (
      <div className="cs-ledger">
        <div className="cs-ledger__group grid">
          <h2 className="cs-ledger__title">{block.title}</h2>
          <ul className="cs-ledger__rows">
            {block.stats.map((stat) => (
              <li key={stat.value} className="cs-ledger__row">
                <span className="cs-ledger__value">{stat.value}</span>
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* The reflection is one paragraph (2026-11-10), so it takes the
            rows' column and hairlines as a single row of prose. */}
        <div className="cs-ledger__group grid">
          <h3 className="cs-ledger__title">{block.learningsTitle}</h3>
          <div className="cs-ledger__rows">
            <p className="cs-ledger__prose">{block.reflection}</p>
          </div>
        </div>
      </div>
    );
  }

  // Stats and Statement: the label, then the reflection at lede size.
  const learnings = (
    <div className="cs-learnings">
      <h3 className="cs-label">{block.learningsTitle}</h3>
      <p className="cs-lede">{block.reflection}</p>
    </div>
  );

  if (take === "statement") {
    return (
      <>
        <h2 className="cs-label">{block.title}</h2>
        <p className="cs-statement">
          <Starred text={block.summary} />
        </p>
        {learnings}
      </>
    );
  }

  return (
    <>
      <h2 className="cs-heading">{block.title}</h2>
      <ul className="cs-stats grid">
        {block.stats.map((stat) => (
          <li key={stat.value}>
            <p className="cs-stats__value">{stat.value}</p>
            <p className="cs-stats__label">{stat.label}</p>
          </li>
        ))}
      </ul>
      {learnings}
    </>
  );
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
 *  the box before it loads. An animated GIF with a `still` swaps to it
 *  under reduced motion, through <picture>, so the browser picks before
 *  it fetches and the GIF is never downloaded for those visitors. */
function Picture({ image, className, eager }: { image: Img; className?: string; eager?: boolean }) {
  const tag = (
    <img
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      // Explicit, so the box holds its shape even if the load fails (a
      // broken image drops the ratio the attributes would give it).
      style={{ aspectRatio: `${image.width} / ${image.height}` }}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={retryOnce}
    />
  );
  const img = image.still ? (
    <picture>
      <source media="(prefers-reduced-motion: reduce)" srcSet={image.still} />
      {tag}
    </picture>
  ) : (
    tag
  );
  return image.look === "cutout" ? (
    <div className={`cs-cutout ${className ?? ""}`}>{img}</div>
  ) : (
    <div className={`cs-frame ${className ?? ""}`}>{img}</div>
  );
}

/** One more try at an image that failed, with a query so neither the
 *  browser nor the host's cache hands back the same failure. A one-off
 *  miss (the live Infinity page lost a phone on 2026-11-11, probably mid
 *  redeploy) then fixes itself; a file that's really missing fails twice
 *  and stops, rather than looping. In a <picture> whose <source> matched
 *  (the reduced-motion still) the source wins and this changes nothing;
 *  that case is a small JPEG, so it's left alone. */
function retryOnce(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.dataset.retried) return;
  img.dataset.retried = "1";
  const url = new URL(img.currentSrc || img.src, window.location.href);
  url.searchParams.set("retry", "1");
  img.src = url.toString();
}
