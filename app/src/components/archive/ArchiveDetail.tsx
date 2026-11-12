import type { ArchiveProject } from "../../data/archive";
import ArchiveCarousel from "./ArchiveCarousel";

/**
 * The pieces every Archive layout shows a project with, so a layout is
 * arrangement only and the words and screens look the same in all of them.
 *
 *  - ArchiveSummary: hook, summary, what I designed, outcome (only when
 *    there is one). No team credit (Micah, 2026-11-11: not needed). Type
 *    comes from the --ax-* tokens on .ax.
 *  - ArchiveMedia: the carousel, or (before it's wanted) an empty box of
 *    exactly its size, so nothing reflows when it arrives.
 *  - ArchiveDetail: the two side by side, the open state of Index and Titles.
 *  - ArchivePanel: ArchiveDetail in the fold that opens and closes.
 *  - Chevron: the open/closed marker on a row (points down, flips up open).
 */

export function ArchiveSummary({ project }: { project: ArchiveProject }) {
  return (
    <>
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
    </>
  );
}

export function ArchiveMedia({ project, ready }: { project: ArchiveProject; ready: boolean }) {
  return ready ? (
    <ArchiveCarousel project={project} />
  ) : (
    <div className="ax-carousel ax-carousel--placeholder" aria-hidden="true">
      <div className="ax-stage cs-frame" />
      <div className="ax-controls" />
    </div>
  );
}

export function ArchiveDetail({ project, carousel }: { project: ArchiveProject; carousel: boolean }) {
  return (
    <div className="ax-detail">
      <div className="ax-detail__text">
        <ArchiveSummary project={project} />
      </div>
      <div className="ax-detail__media">
        <ArchiveMedia project={project} ready={carousel} />
      </div>
    </div>
  );
}

/** The fold: grid rows 0fr to 1fr, so it opens by its own height and
 *  everything below rides down with it (see .ax-panel). */
export function ArchivePanel({
  project,
  open,
  carousel,
  labelledBy,
  panelRef,
}: {
  project: ArchiveProject;
  open: boolean;
  carousel: boolean;
  /** The id of the button that opens it. */
  labelledBy: string;
  panelRef: (el: HTMLElement | null) => void;
}) {
  return (
    <div
      className="ax-panel"
      id={`${project.slug}-panel`}
      role="region"
      aria-labelledby={labelledBy}
      data-open={open}
      ref={panelRef}
    >
      <div className="ax-panel__inner">
        <ArchiveDetail project={project} carousel={carousel} />
      </div>
    </div>
  );
}

export function Chevron() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9.5l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
