import { Fragment, useEffect } from "react";
import type { Block, CaseStudy, Img, Note } from "../data/caseStudies";
import { CASE_LAB, LabState, useLab } from "../lab";
import LabPanel from "./LabPanel";
import BeforeAfter from "./BeforeAfter";
import Slideshow from "./Slideshow";
import SiteFooter from "./SiteFooter";
import BackToTop from "./BackToTop";

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
  // The ds's "{Project} · Micah Lindenberger", with a middle dot for the
  // dash (no em dashes anywhere, titles included).
  useEffect(() => {
    document.title = `${study.name} · Micah Lindenberger`;
  }, [study.name]);

  const [lab, setLab] = useLab();
  // Read at the click, like the homepage's links in: the lab rewrites the
  // query in an effect, after this render.
  const goHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.href = `/${window.location.search}`;
  };

  // The Outcomes lab only has something to switch where there's a results
  // block (Opendoor); elsewhere the pill would open onto nothing.
  const hasLab = study.blocks.some((block) => block.kind === "results");

  return (
    <div className="cs-page">
      {/* A pill, not the name (Micah, 2026-11-08): it says what it does.
          Stands in until a proper case-study nav lets you jump between
          projects.

          Locked on scroll (Micah, 2026-11-10), the same on every case study,
          applicants.micahburger.com included: it rests above the title, then
          sticks 24px from the top as the page goes up under it. It's its own
          sticky bar, outside the header, because sticky only holds inside
          its parent; inside the header it would let go as soon as the title
          scrolled away. .cs-page holds the footer too, so it stays put all
          the way to the bottom. */}
      <nav className="cs-bar wrap" aria-label="Site">
        <a className="cs-home" href="/" onClick={goHome} onAuxClick={goHome}>
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
          Back to home
        </a>
      </nav>

      <main className="cs">
        <header className="cs-hero wrap">
          <h1 className="cs-hero__title" tabIndex={-1}>
            {study.title}
          </h1>
        </header>

        {study.blocks.map((block, i) => (
          <section
            key={i}
            className={`cs-block cs-block--${block.kind} ${(block.kind === "heading" && block.ruled) || block.kind === "results" ? "cs-block--ruled" : ""} wrap`}
          >
            <BlockView block={block} outcomes={lab.outcomes} />
          </section>
        ))}

        <nav className="cs-end wrap" aria-label="Case study">
          <a className="u-line" href="/" onClick={goHome} onAuxClick={goHome}>
            Back to all work
          </a>
        </nav>
      </main>

      <SiteFooter />
      <BackToTop />
      {hasLab && <LabPanel keys={CASE_LAB} lab={lab} setLab={setLab} />}
    </div>
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
 * puts the numbers first and shrinks each learning to a claim and a line.
 *
 *  - STATS: the three numbers huge in a row, one short label under each,
 *    then the learnings in three quiet columns on the same grid lines.
 *  - LEDGER: a two-column table, the ds "table index" register. Section
 *    names on the left in four columns, rows with hairlines on the right:
 *    number then label, learning title then line.
 *  - STATEMENT: the numbers as one large sentence with the figures in the
 *    accent, then the learnings as three ruled columns underneath.
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
        <div className="cs-ledger__group grid">
          <h3 className="cs-ledger__title">{block.learningsTitle}</h3>
          <ul className="cs-ledger__rows">
            {block.learnings.map((note) => (
              <li key={note.title} className="cs-ledger__row">
                <span className="cs-ledger__claim">{note.title}</span>
                <span>{note.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const learnings = (
    <div className="cs-learnings">
      <h3 className="cs-label">{block.learningsTitle}</h3>
      <ul className="cs-learnings__list grid">
        {block.learnings.map((note) => (
          <li key={note.title}>
            <p className="cs-learnings__claim">{note.title}</p>
            <p>{note.body}</p>
          </li>
        ))}
      </ul>
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
