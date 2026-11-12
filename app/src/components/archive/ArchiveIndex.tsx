import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { archiveSrc, isTbd, type ArchiveProject } from "../../data/archive";
import { prefersReducedMotion } from "../../motion";
import ArchiveCarousel from "./ArchiveCarousel";
import HoverPreview from "./HoverPreview";
import type { ArchiveLayoutProps } from "./layouts";

/**
 * ?layout=index, the first Archive layout (2026-11-11): an interactive index.
 *
 * A short intro, then one row per project: thumbnail, client and project,
 * disciplines, year. It's the ds's "table index" pattern (Recipe 10): rows
 * on hairlines, and on a fine pointer the lead image follows the cursor
 * over a closed row. A row is a real button; pressing it opens the project
 * in place, summary on the left and its screens on the right, and closes
 * whichever was open, so only one is ever open.
 *
 * Opening scrolls the row up under the locked Back to home bar. Each project
 * is an anchor: opening one writes #<slug> into the URL (replaceState, so
 * the back button isn't filled with rows), and a link to
 * /project/archive#<slug> opens that one on arrival, already expanded.
 *
 * No layout shift: the thumbnail and screens sit in boxes of fixed shape,
 * and a panel opens by animating its own height (grid rows 0fr to 1fr), so
 * nothing below it jumps; it moves with the panel. A panel's carousel isn't
 * mounted until the panel first opens, so closed rows don't load their
 * screens.
 */
export default function ArchiveIndex({ archive }: ArchiveLayoutProps) {
  const projects = archive.projects;
  const slugFromHash = useCallback(() => {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    return projects.some((p) => p.slug === slug) ? slug : null;
  }, [projects]);

  const [open, setOpen] = useState<string | null>(slugFromHash);
  /** Panels that have been opened at least once: their carousels stay
   *  mounted, so closing and reopening doesn't reload or reset them. */
  const [mounted, setMounted] = useState<Set<string>>(() => new Set(open ? [open] : []));
  const [hovered, setHovered] = useState<string | null>(null);
  const items = useRef(new Map<string, HTMLLIElement>());
  const panels = useRef(new Map<string, HTMLDivElement>());

  /**
   * Brings a row to the top, just under the locked bar (its scroll-margin,
   * in CSS). When the row being closed (`closing`) is above this one, what
   * it still has left to fold comes off the target, measured at the moment
   * the scroll starts: with the animation that's nearly its full height,
   * and the scroll and the fold finish together in the right place; under
   * reduced motion it has already folded, so it's nothing. (Measuring it
   * before the fold began double-counted it whenever the fold was
   * instant.) The list turns scroll anchoring off for the same reason; see
   * .ax-list.
   */
  const scrollToRow = useCallback((slug: string, smooth: boolean, closing: string | null = null) => {
    const el = items.current.get(slug);
    if (!el) return;
    let stillToFold = 0;
    const prevItem = closing ? items.current.get(closing) : undefined;
    const prevPanel = closing ? panels.current.get(closing) : undefined;
    if (prevItem && prevPanel && prevItem.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) {
      stillToFold = prevPanel.getBoundingClientRect().height;
    }
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    const top = el.getBoundingClientRect().top + window.scrollY - margin - stillToFold;
    window.scrollTo({ top: Math.max(0, top), behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto" });
  }, []);

  const writeHash = (slug: string | null) => {
    const { pathname, search } = window.location;
    window.history.replaceState(window.history.state, "", `${pathname}${search}${slug ? `#${slug}` : ""}`);
  };

  // The open row as of the last render, for the hash listener (which is
  // set up once and would otherwise see a stale `open`).
  const openRef = useRef(open);
  openRef.current = open;

  const show = useCallback(
    (slug: string, closing: string | null) => {
      setOpen(slug);
      setMounted((prev) => (prev.has(slug) ? prev : new Set(prev).add(slug)));
      // A frame later: the new state is laid out and the old panel's fold
      // has just begun.
      requestAnimationFrame(() => scrollToRow(slug, true, closing && closing !== slug ? closing : null));
    },
    [scrollToRow],
  );

  const toggle = (slug: string) => {
    if (open === slug) {
      setOpen(null);
      writeHash(null);
      return;
    }
    show(slug, open);
    writeHash(slug);
  };

  // Arriving on #<slug>: the row is open from the first render (no
  // animation, since there was no closed state to animate from); bring it
  // into view once laid out. The browser's own jump to the anchor can't do
  // it, because the list isn't in the DOM yet when it tries.
  useLayoutEffect(() => {
    if (open) scrollToRow(open, false);
    // First render only: later opens scroll from toggle() or the hash
    // listener below.
  }, []);

  // A link to another #<slug> while already here (or an edited URL).
  useEffect(() => {
    const onHash = () => {
      const slug = slugFromHash();
      if (slug) show(slug, openRef.current);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [show, slugFromHash]);

  // A closed panel is out of the tab order and hidden from screen readers;
  // `inert` does both and, unlike `hidden`, lets the height animate.
  useEffect(() => {
    panels.current.forEach((panel, slug) => {
      panel.inert = slug !== open;
    });
  }, [open]);

  const previewProject = hovered && hovered !== open ? projects.find((p) => p.slug === hovered) : undefined;

  return (
    <section className="ax wrap" aria-label={archive.title}>
      <p className="ax-intro">{archive.intro}</p>

      <ul className="ax-list">
        {projects.map((project) => {
          const isOpen = project.slug === open;
          return (
            <li
              key={project.slug}
              id={project.slug}
              className={`ax-item ${isOpen ? "is-open" : ""}`}
              ref={(el) => {
                if (el) items.current.set(project.slug, el);
                else items.current.delete(project.slug);
              }}
            >
              <h2 className="ax-item__heading">
                <button
                  type="button"
                  className="ax-row"
                  id={`${project.slug}-row`}
                  aria-expanded={isOpen}
                  aria-controls={`${project.slug}-panel`}
                  // Spelled out, because the row's parts are separate boxes
                  // and its text alone reads as one run-on word
                  // ("WWEWWE.com redesignSenior…"). Same words, in order.
                  aria-label={`${project.client}, ${project.project}. ${project.role.join(", ")}. ${isTbd(project.year) ? "Year to be confirmed" : project.year}`}
                  onClick={() => toggle(project.slug)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(project.slug)}
                  onPointerLeave={() => setHovered((h) => (h === project.slug ? null : h))}
                >
                  <RowContent project={project} />
                </button>
              </h2>
              <div
                className="ax-panel"
                id={`${project.slug}-panel`}
                role="region"
                aria-labelledby={`${project.slug}-row`}
                data-open={isOpen}
                ref={(el) => {
                  if (el) panels.current.set(project.slug, el);
                  else panels.current.delete(project.slug);
                }}
              >
                <div className="ax-panel__inner">
                  <Detail project={project} carousel={mounted.has(project.slug)} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <HoverPreview project={previewProject} preload={projects} />
    </section>
  );
}

function RowContent({ project }: { project: ArchiveProject }) {
  const lead = project.images[0];
  return (
    <>
      <span className="ax-row__thumb">
        <img
          src={archiveSrc(project.slug, lead, "thumb")}
          alt=""
          width={96}
          height={Math.round((96 * lead.height) / lead.width)}
          decoding="async"
        />
      </span>
      <span className="ax-row__name">
        <span className="ax-row__client">{project.client}</span>
        <span className="ax-row__project">{project.project}</span>
      </span>
      <span className="ax-row__role">{project.role.join(" · ")}</span>
      <span className={`ax-row__year ${isTbd(project.year) ? "is-tbd" : ""}`}>{project.year}</span>
      <span className="ax-row__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
    </>
  );
}

function Detail({ project, carousel }: { project: ArchiveProject; carousel: boolean }) {
  return (
    <div className="ax-detail">
      <div className="ax-detail__text">
        <p className="ax-hook">{project.hook}</p>
        <p className="ax-summary">{project.summary}</p>

        <h3 className="ax-label">What I designed</h3>
        <ul className="ax-delivered">
          {project.delivered.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        {project.outcome && (
          <>
            <h3 className="ax-label">Outcome</h3>
            <p className="ax-outcome">{project.outcome}</p>
          </>
        )}

        <h3 className="ax-label">Team</h3>
        <p className="ax-team">{project.team}</p>
      </div>

      <div className="ax-detail__media">
        {carousel ? (
          <ArchiveCarousel project={project} />
        ) : (
          // Holds the carousel's exact box (stage plus controls) so nothing
          // reflows the first time the panel opens.
          <div className="ax-carousel ax-carousel--placeholder" aria-hidden="true">
            <div className="ax-stage cs-frame" />
            <div className="ax-controls" />
          </div>
        )}
      </div>
    </div>
  );
}
